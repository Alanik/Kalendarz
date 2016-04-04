using System;
using System.Collections.Generic;

namespace KalendarzKarieryData.Models.DataTransferModels.Events
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
