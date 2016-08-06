using KalendarzKarieryData.Models.DataTransferModels.Events;
using KalendarzKarieryData.Models.DataTransferModels.Notes;
using System;
using System.Collections.Generic;

namespace KalendarzKarieryData.Models.ViewModels
{
	[Serializable]
	public class IndexViewModel
	{
		//TODO: remove anonymous types (object)

		public ICollection<JsonEventModel> UpcomingPublicEvents { get; set; }
		public IList<EventsGroupedByYearModel> MyEvents { get; set; }
		public IList<EventsGroupedByYearModel> PublicEvents { get; set; }
		public IList<NotesGroupedByYearModel> MyNotes { get; set; }
		public ICollection<JsonEventModel> News { get; set; }
		public ICollection<object> EventKinds { get; set; }
		public ICollection<object> PrivacyLevels { get; set; }
		public object MyEventCountTree { get; set; }
		public object PublicEventCountTree { get; set; }
	}
}
