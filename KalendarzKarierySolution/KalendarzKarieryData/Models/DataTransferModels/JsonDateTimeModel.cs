using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.DataTransferModels
{
	[Serializable]
	public class JsonDateTimeModel
	{
		public int year { get; set; }
		public int month { get; set; }
		public int day { get; set; }
		public int hour { get; set; }
		public int minute { get; set; }

		public JsonDateTimeModel( DateTime m )
		{
			year = m.Year;
			month = m.Month;
			day = m.Day;
			hour = m.Hour;
			minute = m.Minute;
		}
	}
}
