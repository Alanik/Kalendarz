﻿namespace KalendarzKarieryData.Models.ViewModels
{
    public class AddEventViewModel
	{
		public Event Event { get; set; }
		public DateModel StartDate { get; set; }
		public Address Address { get; set; }
		public EventKind EventKind { get; set; }
		public PrivacyLevel PrivacyLevel { get; set; }
		public EventStatus EventStatus { get; set; }
		public DateTimeModel EventStartDate { get; set; }
		public DateTimeModel EventEndDate { get; set; }
	}
}