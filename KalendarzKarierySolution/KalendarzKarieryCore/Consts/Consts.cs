using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryCore.Consts
{
	public static class Consts
	{

		#region validation

		public const string GeneralValidationErrorMsg = "Formularz zawiera nieprawidłowe dane";
		public const string NotAuthenticatedErrorMsg = "Musisz być zalogowany by wykonać tę operację";
		public const string NotAuthorizedErrorMsg = "Nie masz uprawnień by wykonać tę operację";

		#endregion

		public const string AdminRole = "Administrator";

	}
}
