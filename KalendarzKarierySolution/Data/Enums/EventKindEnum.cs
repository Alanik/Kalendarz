using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKarieryData.Enums
{
	public enum EventKindEnum
	{
		aktualności = 0,
		wydarzenie = 1,
		zajęcia = 2,
		szkolenie = 3,
		kurs = 4,
		spotkanie = 5,
		inne = 6
	}

	public enum PrivacyLevel
	{
		@private = 0,
		@public = 1
	}
}