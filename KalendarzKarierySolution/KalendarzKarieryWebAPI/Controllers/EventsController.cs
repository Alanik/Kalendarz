using System;
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
		public IValidationResponse Get()
		{
			var defaultResponse = new DefaultValidationResponseModel() { IsSuccess = true };
			return defaultResponse;
		}

		// GET api/events/5
		public string Get( int id )
		{
			return "value";
		}

		// POST api/events (add)
		public IValidationResponse Post( AddEventViewModel addEventViewModel )
		{
			if (!User.Identity.IsAuthenticated)
			{
				var response = new DefaultValidationResponseModel();
				response.Message = Consts.NotAuthenticatedErrorMsg;
				response.IsSuccess = false;
				return response;
			}

			if (!ModelState.IsValid)
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = KalendarzKarieryCore.Consts.Consts.GeneralValidationErrorMsg;
				return response;
			}

			var @event = this.GetEventModelFromAddEventViewModel( addEventViewModel );

			if (@event == null)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}

			_repository.AddEvent( @event );
			_repository.Save();

			return new AddEventValidationResponseModel { IsSuccess = true, EventId = @event.Id, DateAdded = @event.DateAdded };
		}

		// PUT api/events/5 (update)
		public void Put( int id, [FromBody] string value )
		{
		}

		// DELETE api/events/5
		public IValidationResponse Delete( int id )
		{
			if (!User.Identity.IsAuthenticated)
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = Consts.NotAuthenticatedErrorMsg;
				return response;
			}

			var @event = _repository.GetEventById( id );

			if (@event != null)
			{
				var response = new DefaultValidationResponseModel();

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

			var r = new DefaultValidationResponseModel();
			r.IsSuccess = false;
			r.Message = Consts.EventDoesNotExistErrorMsg;
			return r;
		}

		private Event GetEventModelFromAddEventViewModel( AddEventViewModel viewModel )
		{
			var @event = new Event();

			var statusId = _repository.GetEventStatusIdByValue( 3 );
			@event.EventStatusId = statusId.Value;

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

			DateTime startDate = new DateTime(viewModel.EventStartDate.Year, viewModel.EventStartDate.Month, viewModel.EventStartDate.Day, viewModel.EventStartDate.Hour, viewModel.EventStartDate.Minute, 0);

			DateTime endDate = new DateTime( viewModel.EventEndDate.Year, viewModel.EventEndDate.Month, viewModel.EventEndDate.Day, viewModel.EventEndDate.Hour, viewModel.EventEndDate.Minute, 0 );

			@event.StartDate = startDate;
			@event.EndDate = endDate;
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

			if (!string.IsNullOrEmpty( viewModel.Address.Street ) || !string.IsNullOrEmpty( viewModel.Address.City ) || !string.IsNullOrEmpty( viewModel.Address.ZipCode ))
			{
				@event.Address = viewModel.Address;
			}

			return @event;
		}

	}
}