using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace KalendarzKariery.Models
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