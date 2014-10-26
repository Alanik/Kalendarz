using System;
using System.ComponentModel.DataAnnotations;

//nie zmieniac namespace'a
namespace KalendarzKarieryData
{
	[MetadataType(typeof(User_Validation))]
	public partial class User
	{
	
	}

	public class User_Validation
	{
		[Required(ErrorMessage = "Pole \"Imie\" nie może być puste.")]
		[Display(Name = "Imie")]
		[RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Pole \"Imie\" musi zawierać same litery.")]
		public string FirstName { get; set; }

		[Required(ErrorMessage = "Pole \"Nazwisko\" nie może być puste.")]
		[Display(Name = "Nazwisko")]
		[RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Pole \"Nazwisko\" musi zawierać same litery.")]
		public string LastName { get; set; }

		[Required(ErrorMessage = "Pole \"Email\" nie może być puste.")]
		[EmailAddress(ErrorMessage = "Pole \"Email\" jest nieprawidłowe.")]
		public string Email { get; set; }

		[Display(Name = "Telefon")]
		[RegularExpression(@"^\d+$", ErrorMessage = "Pole \"Telefon\" powinno zawierać same cyfry.")]
		public string Phone { get; set; }

		//[Required(ErrorMessage = "Pole \"Data urodzenia\" nie może być puste.")]
		[Display(Name = "Data urodzenia")]
		public DateTime BirthDay { get; set; }

		[Required(ErrorMessage = "Pole \"Płeć\" nie może być puste.")]
		[Display(Name = "Płeć")]
		public string Gender { get; set; }

		[Display(Name = "Napisz coś o sobie")]
		public string Bio { get; set; }

		[Display(Name = "Strona Internetowa")]
		public string WebSiteUrl { get; set; }
	}
}