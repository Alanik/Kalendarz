namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
    public class DefaultValidationResponseModel : IValidationResponse
	{
		public bool IsSuccess { get; set; }
		public string Message { get; set; }
	}
}