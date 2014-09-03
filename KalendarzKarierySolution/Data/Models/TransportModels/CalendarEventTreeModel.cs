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
		public IEnumerable<EventsGroupedByMonthModel> eventsGroupedByMonth { get; set; }

		public CalendarEventTreeModel(int year, IEnumerable<EventsGroupedByMonthModel> events)
		{
			this.year = year;
			this.eventsGroupedByMonth = events;
		}
	}
}
