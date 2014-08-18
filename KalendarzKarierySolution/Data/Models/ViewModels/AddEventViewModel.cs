using KalendarzKarieryData;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKarieryData.Models.ViewModels
{
	public class AddEventViewModel
	{
		public Event Event { get; set; }
		public Address Address { get; set; }
		public EventKind EventKind { get; set; }
		public PrivacyLevel PrivacyLevel{ get; set; }
		public EventStatus EventStatus { get; set; } 
	}
}