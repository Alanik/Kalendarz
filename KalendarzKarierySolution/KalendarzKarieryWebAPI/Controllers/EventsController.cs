using System;
using System.Web.Http;
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using KalendarzKarieryData;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryCore.Consts;
using KalendarzKarieryData.BO.Cache;
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
		[HttpGet]
		public string GetEvent( int id )
		{
			return "value";
		}

		// POST api/events (add)
		[HttpPost]
		public IValidationResponse AddEvent( AddEventViewModel addEventViewModel )
		{
			if (!User.Identity.IsAuthenticated)
			{
				return new DefaultValidationResponseModel { Message = Consts.NotAuthenticatedErrorMsg, IsSuccess = false };
			}

			if (!ModelState.IsValid)
			{
				return new DefaultValidationResponseModel { Message = Consts.GeneralValidationErrorMsg, IsSuccess = false };
			}

			var @event = this.GetEventModelFromAddEventViewModel( addEventViewModel, new Event());

			if (@event == null)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}

			_repository.AddEvent( @event, @event.Address );

			return new AddEventValidationResponseModel { IsSuccess = true, EventId = @event.Id, DateAdded = @event.CreateDate};
		}

		// PUT api/events/5 (update)
		[HttpPut]
		public IValidationResponse UpdateEvent( AddEventViewModel addEventViewModel )
		{
			if (!User.Identity.IsAuthenticated)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.NotAuthenticatedErrorMsg };
			}

			if (!ModelState.IsValid)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralValidationErrorMsg };
			}

			if (addEventViewModel.Event == null)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralValidationErrorMsg };
			}

			var @event = _repository.GetEventById( addEventViewModel.Event.Id );
			var year = @event.StartDate.Year;
			var month = @event.StartDate.Month;
			var day = @event.StartDate.Day;

			if (@event != null)
			{
				if (!@event.User.UserName.Equals(User.Identity.Name, StringComparison.InvariantCultureIgnoreCase))
				{
					return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
				}

				@event = this.GetEventModelFromAddEventViewModel( addEventViewModel, @event );

				if (@event == null)
				{
					return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
				}

				_repository.UpdateEvent( @event, @event.Address );

				return new UpdateEventValidationResponseModel { IsSuccess = true, EventId = @event.Id, Year = year, Month = month, Day = day };
			}
			else
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.EventDoesNotExistErrorMsg };
			}
		}

		[HttpPost]
		public IValidationResponse AddExistingEventToUser( AddExistingEventToUserModel model )
		{
			if (!User.Identity.IsAuthenticated)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.NotAuthenticatedErrorMsg };
			}

			var result = _repository.AddExistingEventToUserCalendar( model.EventId, User.Identity.Name );

			if (result == true)
			{
				return new AddEventValidationResponseModel { IsSuccess = true, EventId = model.EventId };
			}
			else
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}
		}

		[HttpPost]
		public IValidationResponse SignUpUserForEvent( SignUpUserForEventModel model )
		{
			if (!User.Identity.IsAuthenticated)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.NotAuthenticatedErrorMsg };
			}

			var result = _repository.SignUpUserForEvent( model.EventId, User.Identity.Name );

			if (result == true)
			{
				return new AddEventValidationResponseModel { IsSuccess = true, EventId = model.EventId };
			}
			else
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}
		}

		// DELETE api/events/5
		[HttpDelete]
		public IValidationResponse DeleteEvent( int id )
		{
			if (!User.Identity.IsAuthenticated)
			{
				return new DefaultValidationResponseModel{ IsSuccess = false, Message = Consts.NotAuthenticatedErrorMsg };
			}

			var @event = _repository.GetEventById( id );

			if (@event != null)
			{
				if (@event.User.UserName.Equals(User.Identity.Name, StringComparison.InvariantCultureIgnoreCase))
				{
					_repository.DeleteEvent( @event, @event.Address );

					return new DefaultValidationResponseModel { IsSuccess = true, Message = Consts.EventDeletedSuccesfullyMsg };
				}

				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}

			return new DefaultValidationResponseModel{ IsSuccess = false, Message = Consts.EventDoesNotExistErrorMsg };
		}

		private Event GetEventModelFromAddEventViewModel( AddEventViewModel viewModel, Event @event )
		{
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

			if (@event.Id == 0)
			{
				@event.CreateDate = DateTimeFacade.DateTimeNow();
			}
			else
			{
				@event.EditDate = DateTimeFacade.DateTimeNow();
			}

			@event.Description = viewModel.Event.Description;
			@event.Details = viewModel.Event.Details;
			@event.UrlLink = viewModel.Event.UrlLink;
			@event.OccupancyLimit = viewModel.Event.OccupancyLimit;

			DateTime startDate = new DateTime( viewModel.EventStartDate.Year, viewModel.EventStartDate.Month, viewModel.EventStartDate.Day, viewModel.EventStartDate.Hour, viewModel.EventStartDate.Minute, 0 );

			DateTime endDate = new DateTime( viewModel.EventEndDate.Year, viewModel.EventEndDate.Month, viewModel.EventEndDate.Day, viewModel.EventEndDate.Hour, viewModel.EventEndDate.Minute, 0 );

			@event.StartDate = startDate;
			@event.EndDate = endDate;
			@event.Price = viewModel.Event.Price;

			var eventKind = _repository.GetEventKindByValue( viewModel.EventKind.Value );
			if (eventKind != null)
			{
				@event.EventKindId = eventKind.Id;
			}
			else
			{
				return null;
			}

			var privacyLevel = _repository.GetPrivacyLevelByValue( viewModel.PrivacyLevel.Value );
			if (privacyLevel != null)
			{
				@event.PrivacyLevelId = privacyLevel.Id;
			}
			else
			{
				return null;
			}

			if (!string.IsNullOrWhiteSpace( viewModel.Address.Street ) || !string.IsNullOrWhiteSpace( viewModel.Address.City ) || !string.IsNullOrWhiteSpace( viewModel.Address.ZipCode ))
			{
				if (@event.AddressId.HasValue)
				{
					viewModel.Address.Id = @event.AddressId.Value;
				}

				@event.Address = viewModel.Address;
			}

			return @event;
		}
	}
}