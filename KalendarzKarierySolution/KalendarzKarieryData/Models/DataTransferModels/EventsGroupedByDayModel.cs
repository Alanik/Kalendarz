using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.DataTransferModels
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
