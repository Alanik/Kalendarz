using System;

namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
    public class AddEventValidationResponseModel : BaseResponseModel
	{
		public int EventId { get; set; }
		public DateTime DateAdded { get; set; }
	}
}