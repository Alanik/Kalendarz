using KalendarzKarieryData;
using KalendarzKarieryData.Models.AccountModels;

namespace KalendarzKarieryData.Models.ViewModels
{
	public class RegisterViewModel
	{
		public RegisterModel RegisterModel { get; set; }
		public BirthDateModel BirthDateModel { get; set; }
		public User User { get; set; }
		public Address Address {get; set;}
	}
}