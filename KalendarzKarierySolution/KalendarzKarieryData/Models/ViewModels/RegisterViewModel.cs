using KalendarzKarieryData;
using KalendarzKarieryData.Models.AccountModels;

namespace KalendarzKarieryData.Models.ViewModels
{
	public class RegisterViewModel
	{
		public RegisterModel RegisterModel { get; set; }
		public DateModel BirthDateModel { get; set; }
		public User User { get; set; }
	}
}