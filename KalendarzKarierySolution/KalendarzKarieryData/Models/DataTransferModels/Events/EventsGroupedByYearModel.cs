using System;
using System.Collections.Generic;

namespace KalendarzKarieryData.Models.DataTransferModels.Events
{
    [Serializable]
	public class EventsGroupedByYearModel
	{
		public int year { get; set; }
		public IEnumerable<EventsGroupedByMonthModel> eventsGroupedByMonth { get; set; }

		public EventsGroupedByYearModel(int year, IEnumerable<EventsGroupedByMonthModel> events)
		{
			this.year = year;
			this.eventsGroupedByMonth = events;
		}
	}
}
