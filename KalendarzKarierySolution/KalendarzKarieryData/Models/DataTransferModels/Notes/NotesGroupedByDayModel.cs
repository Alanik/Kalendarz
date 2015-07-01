using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.DataTransferModels.Notes
{

	[Serializable]
	public class NotesGroupedByDayModel
	{
		public int day { get; set; }
		public IEnumerable<JsonNoteModel> notes { get; set; }

		public NotesGroupedByDayModel(int day, IEnumerable<JsonNoteModel> notes)
		{
			this.day = day;
			this.notes = notes;
		}
	}
}
