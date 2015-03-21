using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
	public class AddEventResponseModel : IResponse
	{
		public int EventId { get; set; }
		public bool IsSuccess { get; set; }
		public DateTime DateAdded { get; set; }
	}
}