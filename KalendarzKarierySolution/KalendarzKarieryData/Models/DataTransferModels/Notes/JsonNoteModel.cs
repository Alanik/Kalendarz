using System;

namespace KalendarzKarieryData.Models.DataTransferModels.Notes
{
    [Serializable]
	public class JsonNoteModel
	{
		public int id { get; set; }
		public string data { get; set; }
		public JsonDateTimeModel dateAdded { get; set; }
		public JsonDateTimeModel displayDate { get; set; }
		public object privacyLevel { get; set; }
		public bool isLineThrough { get; set; }
		public string addedBy { get; set; }

		public JsonNoteModel( Note m )
		{		
				id = m.Id;
				data = m.Data;
				dateAdded = new JsonDateTimeModel(m.CreateDate);
				displayDate = new JsonDateTimeModel(m.DisplayDate);
				privacyLevel = new { name = m.PrivacyLevel.Name, value = m.PrivacyLevel.Value };
				isLineThrough = m.IsLineThrough;
				addedBy = m.User.UserName;
		}
	}
}
