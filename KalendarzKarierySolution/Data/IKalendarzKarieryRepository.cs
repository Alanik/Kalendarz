using System;
using System.Collections.Generic;
using System.Diagnostics.Eventing.Reader;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData
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
		IList<Event> GetEventsForGivenMonth(int month); 

		#endregion


		void Save();
	}
}
