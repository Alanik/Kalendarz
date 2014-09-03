using KalendarzKarieryData.Models.TransportModels;
using System;
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

		User GetUserById(int id);
		User GetUserByEmail(string email);
		void UpdateUserOnRegister(int id, Address address);
		int GetUserIdByName(string name);

		#endregion

		#region Event

		void AddEvent(Event @event);
		//CalendarEventTreeModel GetAllEventsForGivenMonthByUserId(string userName, int month, int year); 
		CalendarEventTreeModel GetAllEventsForGivenYearByUserId(string userName, int year);
		ICollection<object> GetAllPrivacyLevels();
		ICollection<object> GetAllEventKinds();
		PrivacyLevel GetPrivacyLevelByValue(int id);
		EventKind GetEventKindByValue(int id);

		#endregion

		void Save();
	}
}
