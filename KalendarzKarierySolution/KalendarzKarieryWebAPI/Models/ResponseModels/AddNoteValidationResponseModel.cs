namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
    public class AddNoteValidationResponseModel : IValidationResponse
	{
		public int NoteId { get; set; }
		public bool IsSuccess { get; set; }
	}
}