using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.DataTransferModels.Notes
{
	[Serializable]
	public class NotesGroupedByYearModel
	{
		public int year { get; set; }
		public IEnumerable<NotesGroupedByMonthModel> notesGroupedByMonth { get; set; }

		public NotesGroupedByYearModel(int year, IEnumerable<NotesGroupedByMonthModel> notes)
		{
			this.year = year;
			this.notesGroupedByMonth = notes;
		}
	}
}
