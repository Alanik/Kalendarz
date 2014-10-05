using KalendarzKarieryData.Models.TransportModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.ViewModels
{
	[Serializable]
	public class IndexViewModel
	{

		//TODO: remove anonymous types

		public IList<EventsGroupedByYearModel> MyEvents { get; set; }
		public IList<EventsGroupedByYearModel> PublicEvents { get; set; }
		public ICollection<object> EventKinds { get; set; }
		public ICollection<object> PrivacyLevels { get; set; }
		public object MyEventCountTree { get; set; }
		public object PublicEventCountTree { get; set; }
	}
}
