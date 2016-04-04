namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
    public class UpdateNoteValidationResponseModel : IValidationResponse
	{
		public int NoteId { get; set; }
		public bool IsSuccess { get; set; }
	}
}