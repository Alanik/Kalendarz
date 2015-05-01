
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
		public DateModel StartDate { get; set; }
		public Address Address { get; set; }
		public EventKind EventKind { get; set; }
		public PrivacyLevel PrivacyLevel { get; set; }
		public EventStatus EventStatus { get; set; }
		public DateTimeModel EventStartDate {get; set;}
		public DateTimeModel EventEndDate {get; set;}
	}

	public class DateTimeModel
	{
		public int Day { get; set; }

		public int Month { get; set; }

		public int Year { get; set; }

		public int Hour { get; set; }

		public int Minute { get; set; }
	}
}