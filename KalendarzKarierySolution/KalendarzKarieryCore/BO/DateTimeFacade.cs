using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryCore.BO
{
	public static class DateTimeFacade
	{
		private const string CentralEuropeanStandardTime = "Central European Standard Time";

		public static DateTime DateTimeNow()
		{
			TimeZoneInfo zone = TimeZoneInfo.FindSystemTimeZoneById( CentralEuropeanStandardTime );
			DateTime polishDateTime = TimeZoneInfo.ConvertTimeFromUtc( DateTime.UtcNow, zone );
			return polishDateTime;
		}

		public static DateTime? GetEuropeanCentralStandardTimeFromUTC( DateTime? utcTime )
		{
			TimeZoneInfo zone = TimeZoneInfo.FindSystemTimeZoneById( CentralEuropeanStandardTime );
			DateTime? polishDateTime = TimeZoneInfo.ConvertTimeFromUtc( utcTime.Value, zone );
			return polishDateTime;
		}
	}
}
