using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.TransportModels
{
	[Serializable]
	public class EventsGroupedByMonthModel
	{
		public int month { get; set; }
		public IEnumerable<EventsGroupedByDayModel> eventsGroupedByDay { get; set; }

		public EventsGroupedByMonthModel( int month, IEnumerable<EventsGroupedByDayModel> eventsGroupedByDay )
		{
			this.month = month;
			this.eventsGroupedByDay = eventsGroupedByDay;
		}

	}
}
