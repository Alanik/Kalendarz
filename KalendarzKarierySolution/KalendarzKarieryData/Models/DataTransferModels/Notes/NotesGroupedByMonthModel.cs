using System;
using System.Collections.Generic;

namespace KalendarzKarieryData.Models.DataTransferModels.Notes
{
    [Serializable]
	public class NotesGroupedByMonthModel
	{
		public int month { get; set; }
		public IEnumerable<NotesGroupedByDayModel> notesGroupedByDay { get; set; }

		public NotesGroupedByMonthModel( int month, IEnumerable<NotesGroupedByDayModel> notesGroupedByDay )
		{
			this.month = month;
			this.notesGroupedByDay = notesGroupedByDay;
		}
	}
}
