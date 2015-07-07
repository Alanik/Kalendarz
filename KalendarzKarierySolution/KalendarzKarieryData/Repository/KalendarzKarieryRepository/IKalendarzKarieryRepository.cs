using KalendarzKarieryData.Models.DataTransferModels.Events;
using KalendarzKarieryData.Models.DataTransferModels.Notes;
using KalendarzKarieryData.Models.ViewModels;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Eventing.Reader;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Repository.KalendarzKarieryRepository
{
	public interface IKalendarzKarieryRepository
	{
		#region User

		User GetUserById( int id );
		User GetUserByEmail( string email );
		int? GetUserIdByName( string name );
		void UpdateUser( User user );

		#endregion

		#region Event

		Event GetEventById( int id );
		void DeleteEvent( Event @event );
		void AddEvent( Event @event );
		void UpdateEvent (Event @event);
	    IList<EventsGroupedByYearModel> GetAllPublicEvents();
		EventsGroupedByYearModel GetAllEventsForGivenYearByUserId( int id, int year );
		ICollection<object> GetAllPrivacyLevels();
		ICollection<object> GetAllEventKinds();
		ICollection<object> GetEventKindsBasedOnUserName( string name );
		PrivacyLevel GetPrivacyLevelByValue( int id );
		EventKind GetEventKindByValue( int id );
		ICollection<JsonEventModel> GetAllNews();
		object GetMyEventCountTree( int userId );
		object GetPublicEventCountTree();
		IList<EventsGroupedByYearModel> GetAllEventsByUserId( int userId );
		int? GetEventStatusIdByValue( int value );

		#endregion

		#region Note

		IList<NotesGroupedByYearModel> GetNotesByUserId( int id );

		Note GetNoteById( int id );

		void DeleteNote( Note note );

		void AddNote( Note note );

		void UpdateNote (Note note);

		#endregion

		void Save();
	}
}
