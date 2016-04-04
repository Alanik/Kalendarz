using System;

namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
    public class AddEventValidationResponseModel : IValidationResponse
	{
		public int EventId { get; set; }
		public bool IsSuccess { get; set; }
		public DateTime DateAdded { get; set; }
	}
}