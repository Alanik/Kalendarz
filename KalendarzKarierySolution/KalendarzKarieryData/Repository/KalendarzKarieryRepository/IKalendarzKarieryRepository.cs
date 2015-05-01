using KalendarzKarieryData.Models.DataTransferModels;
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
		void UpdateUserOnRegister( int id, Address address );
		int? GetUserIdByName( string name );

		#endregion

		#region Event

		Event GetEventById( int id );
		void DeleteEvent( Event @event );
		void AddEvent( Event @event );
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
		int? GetEventStatusIdByValue(int value);

		#endregion

		void Save();
	}
}
