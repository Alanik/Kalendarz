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

		public const string GeneralValidationErrorMsg = "Formularz zawiera nieprawidłowe dane.";
		public const string NotAuthenticatedErrorMsg = "Zaloguj sie by wykonać tę operację.";
		public const string NotAuthorizedErrorMsg = "Nie masz uprawnień by wykonać tę operację.";
		public const string registerUserEmailExistsErrorMsg = "Podany adres email już został użyty. Prosze podać inny adres email.";
		public const string InvalidBirthOfDateErrorMsg = "Podana data urodzenia jest nieprawidłowa.";
		#endregion

		public const string AdminRole = "Administrator";

	}
}
