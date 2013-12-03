using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKariery.Models.ViewModels
{
	public class AddEventViewModel
	{
		public Event Event { get; set; }
		public Address Address { get; set; }
	}
}