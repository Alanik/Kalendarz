using System;

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
	}
}
