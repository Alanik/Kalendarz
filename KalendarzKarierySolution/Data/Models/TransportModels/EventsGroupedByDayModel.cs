using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.TransportModels
{
	[Serializable]
	public class EventsGroupedByDayModel
	{
		public int day { get; set; }
		public IEnumerable<object> events { get; set; }

		public EventsGroupedByDayModel(int day, IEnumerable<object> events)
		{
			this.day = day;
			this.events = events;
		}
	}
}
