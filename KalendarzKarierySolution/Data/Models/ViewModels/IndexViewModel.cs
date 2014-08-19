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

		public CalendarEventTreeModel MyEvents { get; set; }
		public IList<Event> PublicEvents { get; set; }
		public ICollection<object> EventKinds { get; set; }
		public ICollection<object> PrivacyLevels { get; set; }
	}
}
