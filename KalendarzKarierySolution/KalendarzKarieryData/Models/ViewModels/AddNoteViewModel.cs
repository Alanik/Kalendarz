using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.ViewModels
{
	public class AddNoteViewModel
	{
		public string Data { get; set; }
		public DateTimeModel DisplayDate { get; set; }
		public bool IsLineThrough { get; set; }
	}
}
