using System;
using System.Collections.Generic;

namespace KalendarzKarieryData.Models.DataTransferModels.Events
{
    [Serializable]
	public class EventsGroupedByDayModel
	{
		public int day { get; set; }
		public IEnumerable<JsonEventModel> events { get; set; }

		public EventsGroupedByDayModel(int day, IEnumerable<JsonEventModel> events)
		{
			this.day = day;
			this.events = events;
		}
	}
}
