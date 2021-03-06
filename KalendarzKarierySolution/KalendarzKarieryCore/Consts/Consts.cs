﻿namespace KalendarzKarieryCore.Consts
{
    public static class Consts
	{

		#region validation
		public const string GeneralValidationErrorMsg = "Formularz zawiera nieprawidłowe dane.";
		public const string NotAuthenticatedErrorMsg = "Zaloguj sie by wykonać tę operację.";
		public const string NotAuthorizedErrorMsg = "Nie masz uprawnień by wykonać tę operację.";
		public const string RegisterUserEmailExistsErrorMsg = "Podany adres email już został użyty. Prosze podać inny adres email.";
		public const string InvalidBirthOfDateErrorMsg = "Podana data urodzenia jest nieprawidłowa.";
		public const string InvalidUserNameOrPasswordErrorMsg = "Nazwa użytkownika lub hasło jest nieprawidłowe";
		#endregion

		#region Events
		public const string EventDoesNotExistErrorMsg = "Błąd, nie ma takiego wydarzenia.";
		public const string EventDeletedSuccesfullyMsg = "Wydarzenie zostało usunięte.";
		#endregion

		#region Notes
		public const string NoteDeletedSuccesfullyMsg = "Notatka została usunięta.";
		public const string NoteDoesNotExistErrorMsg = "Błąd, taka notatka nie istnieje.";
		#endregion

		#region Cache
		public const string UserIdCacheString = "UserIdCacheString_";
		#endregion

		#region General
		public const string GeneralOperationErrorMsg = "Wystąpił nieoczekiwany błąd. Odświerz strone i spróbuj ponownie.";
		public const string AdminRole = "Administrator";
		#endregion



	}
}
