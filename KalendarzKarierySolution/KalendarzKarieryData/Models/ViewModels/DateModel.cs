using System.ComponentModel.DataAnnotations;

namespace KalendarzKarieryData.Models.ViewModels
{
    public class DateModel
	{
		[RegularExpression( @"^\d+$", ErrorMessage = "Pole \"Dzień\" powinno zawierać same cyfry." )]
		[Required( ErrorMessage = "Pole \"Dzień\" nie może być puste." )]
		public string Day { get; set; }

		[RegularExpression( @"^\d+$", ErrorMessage = "Pole \"Miesiąc\" powinno zawierać same cyfry." )]
		[Required( ErrorMessage = "Pole \"Miesiąc\" nie może być puste." )]
		public string Month { get; set; }

		[RegularExpression( @"^\d+$", ErrorMessage = "Pole \"Rok\" powinno zawierać same cyfry." )]
		[Required( ErrorMessage = "Pole \"Rok\" nie może być puste." )]
		public string Year { get; set; }
	}
}
