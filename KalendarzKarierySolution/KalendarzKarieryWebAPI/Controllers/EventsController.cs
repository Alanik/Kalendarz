﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.UI.WebControls;
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using Newtonsoft.Json;
using KalendarzKarieryData;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryCore.Consts;
using KalendarzKarieryData.BO.Cache;
using System.Text.RegularExpressions;
using KalendarzKarieryCore.BO;


namespace KalendarzKarieryWebAPI.Controllers
{
	public class EventsController : BaseController
	{
		private readonly IKalendarzKarieryRepository _repository = RepositoryProvider.GetRepository();

		// GET api/events
		public IResponse Get()
		{
			var defaultResponse = new DefaultResponseModel() { IsSuccess = true };
			return defaultResponse;
		}

		// GET api/events/5
		public string Get( int id )
		{
			return "value";
		}

		// POST api/events (add)
		public IResponse Post( AddEventViewModel addEventViewModel )
		{
			var errorResponse = this.Validate( addEventViewModel );
			if (errorResponse != null && !errorResponse.IsSuccess)
			{
				return errorResponse;
			}

			if (!ModelState.IsValid)
			{
				var response = new DefaultResponseModel();
				response.IsSuccess = false;
				response.Message = KalendarzKarieryCore.Consts.Consts.GeneralValidationErrorMsg;
				return response;
			}

			var @event = this.GetEventModelFromAddEventViewModel( addEventViewModel );

			if (@event.StartDate.Hour < 7 || @event.EndDate.HasValue && @event.EndDate.Value.Hour >= 21)
			{
				throw new ArgumentException( "godzina rozpoczecia jest wczesniejsza niz 7:00 lub pozniejsza niz 20:00 - drugie podejscie" );
			}

			if (@event == null)
			{
				return new DefaultResponseModel { IsSuccess = false, Message = Consts.GeneralValidationErrorMsg };
			}

			_repository.AddEvent( @event );
			_repository.Save();

			return new AddEventResponseModel { IsSuccess = true, EventId = @event.Id, DateAdded = @event.DateAdded };
		}

		// PUT api/events/5 (update)
		public void Put( int id, [FromBody] string value )
		{
		}

		// DELETE api/events/5
		public IResponse Delete( int id )
		{
			if (!User.Identity.IsAuthenticated)
			{
				var response = new DefaultResponseModel();
				response.IsSuccess = false;
				response.Message = Consts.NotAuthenticatedErrorMsg;
				return response;
			}

			var @event = _repository.GetEventById( id );

			if (@event != null)
			{
				var response = new DefaultResponseModel();

				if (@event.User.UserName.ToLower() == User.Identity.Name.ToLower())
				{
					_repository.DeleteEvent( @event );
					_repository.Save();

					response.IsSuccess = true;
					response.Message = Consts.EventDeletedSuccesfullyMsg;
					return response;
				}

				response.IsSuccess = false;
				response.Message = Consts.GeneralOperationErrorMsg;
				return response;
			}

			var r = new DefaultResponseModel();
			r.IsSuccess = false;
			r.Message = Consts.EventDoesNotExistErrorMsg;
			return r;
		}

		private IResponse Validate( AddEventViewModel addEventViewModel )
		{
			var errorResponse = this.ValidateUser();
			if (!errorResponse.IsSuccess)
			{
				return errorResponse;
			}

			errorResponse = ValidateAddEventViewModel( addEventViewModel );
			if (!errorResponse.IsSuccess)
			{
				return errorResponse;
			}

			return null;
		}

		private Event GetEventModelFromAddEventViewModel( AddEventViewModel viewModel )
		{
			var @event = new Event();

			var objectId = AppCache.Get( User.Identity.Name.ToLower() );
			if (objectId != null)
			{
				@event.OwnerUserId = (int)objectId;
			}
			else
			{
				int? id = _repository.GetUserIdByName( User.Identity.Name );

				if (id.HasValue)
				{
					@event.OwnerUserId = id.Value;
				}
				else
				{
					return null;
				}
			}

			@event.Title = viewModel.Event.Title;
			@event.NumberOfPeopleAttending = 0;
			@event.DateAdded = DateTimeFacade.DateTimeNow();
			@event.Description = viewModel.Event.Description;
			@event.Details = viewModel.Event.Details;
			@event.UrlLink = viewModel.Event.UrlLink;
			@event.OccupancyLimit = viewModel.Event.OccupancyLimit;
			@event.StartDate = viewModel.Event.StartDate;
			@event.EndDate = viewModel.Event.EndDate;
			@event.Price = viewModel.Event.Price;

			var eventKind = _repository.GetEventKindByValue( viewModel.EventKind.Value );
			if (eventKind != null)
			{
				@event.EventKind = eventKind;
			}
			else
			{
				return null;
			}

			var privacyLevel = _repository.GetPrivacyLevelByValue( viewModel.PrivacyLevel.Value );
			if (privacyLevel != null)
			{
				@event.PrivacyLevel = privacyLevel;
			}
			else
			{
				return null;
			}

			if (@event.EndDate <= DateTime.UtcNow)
			{
				var id = _repository.GetEventStatusIdByValue( 2 );
				if (id.HasValue)
				{
					@event.EventStatusId = id.Value;
				}
				else
				{
					return null;
				}
			}
			else
			{
				var id = _repository.GetEventStatusIdByValue( 1 );
				if (id.HasValue)
				{
					@event.EventStatusId = id.Value;
				}
				else
				{
					return null;
				}
			}

			if (!string.IsNullOrEmpty( viewModel.Address.Street ) || !string.IsNullOrEmpty( viewModel.Address.City ) || !string.IsNullOrEmpty( viewModel.Address.ZipCode ))
			{
				@event.Addresses.Add( viewModel.Address );
			}

			return @event;
		}

		private IResponse ValidateAddEventViewModel( AddEventViewModel viewModel )
		{
			var response = new DefaultResponseModel();
			response.IsSuccess = true;

			if (string.IsNullOrEmpty( viewModel.Event.Title ))
			{
				response.IsSuccess = false;
				response.Message = Consts.GeneralValidationErrorMsg;
				return response;
			}
			
			//TODO: temporary check
			if (viewModel.Event.StartDate.Hour < 7 || viewModel.Event.StartDate.Hour >= 21)
			{
				throw new ArgumentException("godzina rozpoczecia jest wczesniejsza niz 7:00 lub pozniejsza niz 20:00");
			}

			if (!string.IsNullOrEmpty( viewModel.Address.ZipCode ))
			{
				var reg = new Regex( "[0-9]{2}-[0-9]{3}" );

				if (!reg.IsMatch( viewModel.Address.ZipCode ))
				{
					response.IsSuccess = false;
					response.Message = Consts.GeneralValidationErrorMsg;
					return response;
				}
			}

			return response;
		}
	}
}