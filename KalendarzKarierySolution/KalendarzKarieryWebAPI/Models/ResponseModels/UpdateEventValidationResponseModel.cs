namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
    public class UpdateEventValidationResponseModel : IValidationResponse
	{
		public int EventId { get; set; }
		public bool IsSuccess { get; set; }
		public int Year { get; set; }
		public int Month { get; set; }
		public int Day { get; set; }
	}
}