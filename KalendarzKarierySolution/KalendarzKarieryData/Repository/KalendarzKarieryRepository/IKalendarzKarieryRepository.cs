using KalendarzKarieryData.Enums;
using KalendarzKarieryData.Models.DataTransferModels.Events;
using KalendarzKarieryData.Models.DataTransferModels.Notes;
using System.Collections.Generic;

namespace KalendarzKarieryData.Repository.KalendarzKarieryRepository
{
    public interface IKalendarzKarieryRepository
	{
		#region User
		User GetUserById( int id );
		User GetUserByEmail( string email );
		int? GetUserIdByName( string name );
		void UpdateUser( User user, Address address );
		void UpdateUserAfterRegistration(User user, Address address);
		void UpdateUserAccountInfo(UserAccountInfo info);
		#endregion

		#region Event
		Event GetEventById( int id );
		void DeleteEvent( Event @event, Address address );
		void AddEvent( Event @event, Address address );
		bool AddExistingEventToUserCalendar( int eventId, string username );
		bool SignUpUserForEvent( int eventId, string username );
		User GetUserByName(string name);
		void UpdateEvent (Event @event, Address address);
	    IList<EventsGroupedByYearModel> GetAllPublicEvents( int? userId);
		EventsGroupedByYearModel GetAllEventsConnectedToUserIdForGivenYear( int id, int year );
		ICollection<object> GetAllPrivacyLevels();
		ICollection<object> GetAllEventKinds();
		ICollection<object> GetEventKindsBasedOnUserName( string name );
		PrivacyLevel GetPrivacyLevelByValue( int id );
		EventKind GetEventKindByValue( int id );
		ICollection<JsonEventModel> GetUpcomingEvents( int numOfEvents, PrivacyLevelEnum privacyLevel );
		object GetMyEventCountTree( int userId );
		object GetPublicEventCountTree();
		IList<EventsGroupedByYearModel> GetAllEventsConnectedToUserId( int userId );
		IList<EventsGroupedByYearModel> GetAllEventsCreatedByUserId( int userId );
		int? GetEventStatusIdByValue( int value );
		#endregion

		#region Note
		IList<NotesGroupedByYearModel> GetNotesByUserId( int id );
		Note GetNoteById( int id );
		void DeleteNote( Note note );
		void AddNote( Note note );
		void UpdateNote (Note note);
		#endregion
	}
}
