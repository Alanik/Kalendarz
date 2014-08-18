using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.ViewModels
{
	public class IndexViewModel
	{

		//TODO: remove anonymous types

		public ICollection<object> PrivateEvents { get; set; }
		public IList<Event> PublicEvents { get; set; }
		public ICollection<object> EventKinds { get; set; }
		public ICollection<object> PrivacyLevels { get; set; }
	}
}
