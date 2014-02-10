using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.UI.WebControls;
using KalendarzKarieryData;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using Newtonsoft.Json;

namespace KalendarzKarieryWebAPI.Controllers
{
	public class EventsController : BaseController
	{
		private static readonly IKalendarzKarieryRepository Repository = new KalendarzKarieryRepository();

		// GET api/events
		public DefaultResponseModel Get()
		{

			string alan;

			if (User.Identity.IsAuthenticated && User.IsInRole("Administrator"))
			{
				alan = "alan";
			}
			else
			{
				alan = "false";
			}

			var defaultResponse = new DefaultResponseModel() { IsSuccess = true };
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
			if (errorResponse != null)
			{			
				return errorResponse;
			}

			if (!ModelState.IsValid)
			{
				IResponse response = new DefaultResponseModel();
				SetResponseToInvalidState(response, ValidationError);

				return response;
			}

			var @event = GetEventModelFromAddEventViewModel(addEventViewModel);

			Repository.AddEvent(@event);
			Repository.Save();

			return new DefaultResponseModel { IsSuccess = true };
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
			var errorResponse = ValidateUser(new DefaultResponseModel());
			if (errorResponse != null)
			{
				return errorResponse;
			}

			errorResponse = ValidateAddEventViewModel(errorResponse, addEventViewModel);
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
			@event.Kind = viewModel.Event.Kind;
			@event.NumberOfPeopleAttending = 0;
			@event.DateAdded = DateTime.Now;
			@event.Description = viewModel.Event.Description;
			@event.PrivacyLevel = viewModel.Event.PrivacyLevel;
			@event.Details = viewModel.Event.Details;
			@event.UrlLink = viewModel.Event.UrlLink;
			@event.OccupancyLimit = viewModel.Event.OccupancyLimit;
			@event.StartDate = viewModel.Event.StartDate;
			@event.EventLengthInMinutes = viewModel.Event.EventLengthInMinutes;

			@event.Addresses.Add(viewModel.Address);

			return @event;
		}
	}
}