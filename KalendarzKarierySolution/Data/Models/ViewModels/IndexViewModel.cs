using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.ViewModels
{
	public class IndexViewModel
	{
		public IList<Event> UserPrivateEvents { get; set; }
		public IList<Event> PublicEvents { get; set; }
	}
}
