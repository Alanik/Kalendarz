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


namespace KalendarzKarieryWebAPI.Controllers
{
	public class EventsController : BaseController
	{
		private static readonly IKalendarzKarieryRepository Repository = RepositoryProvider.GetRepository();

		// GET api/events
		public DefaultResponse Get()
		{
			var defaultResponse = new DefaultResponse() { IsSuccess = true };
			return defaultResponse;
		}

		// GET api/events/5
		public string Get(int id)
		{
			return "value";
		}

		// POST api/events (add)
		public IResponse Post(AddEventViewModel addEventViewModel)
		{
			var errorResponse = Validate(addEventViewModel);
			if (!errorResponse.IsSuccess)
			{
				return errorResponse;
			}

			if (!ModelState.IsValid)
			{
				var response = new DefaultResponse();
				response.IsSuccess = false;
				response.Message = KalendarzKarieryCore.Consts.Consts.GeneralValidationErrorMsg;
				return response;
			}

			var @event = GetEventModelFromAddEventViewModel(addEventViewModel);

			if (@event == null)
			{
				return new DefaultResponse { IsSuccess = false, Message = Consts.GeneralValidationErrorMsg };
			}

			Repository.AddEvent(@event);
			Repository.Save();

			return new DefaultResponse { IsSuccess = true };
		}

		// PUT api/events/5 (update)
		public void Put(int id, [FromBody] string value)
		{
		}

		// DELETE api/events/5
		public void Delete(int id)
		{
		}

		private IResponse Validate(AddEventViewModel addEventViewModel)
		{
			var errorResponse = this.ValidateUser();
			if (errorResponse != null)
			{
				return errorResponse;
			}

			errorResponse = ValidateAddEventViewModel(addEventViewModel);
			if (errorResponse != null)
			{
				return errorResponse;
			}

			return null;
		}

		private Event GetEventModelFromAddEventViewModel(AddEventViewModel viewModel)
		{
			var @event = new Event();

			@event.OwnerUserId = Repository.GetUserIdByName(User.Identity.Name);
			@event.Title = viewModel.Event.Title;
			@event.NumberOfPeopleAttending = 0;
			@event.DateAdded = DateTime.Now;
			@event.Description = viewModel.Event.Description;
			@event.Details = viewModel.Event.Details;
			@event.UrlLink = viewModel.Event.UrlLink;
			@event.OccupancyLimit = viewModel.Event.OccupancyLimit;
			@event.StartDate = viewModel.Event.StartDate;
			@event.EventLengthInMinutes = viewModel.Event.EventLengthInMinutes;

			var eventKind = Repository.GetEventKindByValue(viewModel.EventKind.Value);
			if (eventKind != null)
			{
				@event.EventKind = eventKind;
			}
			else
			{
				return null;
			}

			var privacyLevel = Repository.GetPrivacyLevelByValue(viewModel.PrivacyLevel.Value);
			if (privacyLevel != null)
			{
				@event.PrivacyLevel = privacyLevel;
			}
			else
			{
				return null;
			}

			@event.EventStatusId = 3;

			if (!string.IsNullOrEmpty(viewModel.Address.Street))
			{
				@event.Addresses.Add(viewModel.Address);
			}

			return @event;
		}
	}
}