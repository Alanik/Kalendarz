using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.TransportModels
{
	[Serializable]
	public class CalendarEventTreeModel
	{
		public int year { get; set; }
		public int month { get; set; }
		public IEnumerable<EventsGroupedByDayModel> eventsGroupedByDay { get; set; }

		public CalendarEventTreeModel(int month, int year, IEnumerable<EventsGroupedByDayModel> events)
		{
			this.year = year;
			this.month = month;
			this.eventsGroupedByDay = events;
		}
	}
}
