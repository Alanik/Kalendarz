using System;
using System.ComponentModel.DataAnnotations;

namespace KalendarzKarieryData.Models.ValidationModels
{

	[MetadataType(typeof(Event_Validation))]
	public partial class Event
	{

	}

	public class Event_Validation
	{

		[DataType(DataType.Date)]
		[DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:dd/MM/yyyy}")]
		public DateTime StartDate { get; set; }

	}
}