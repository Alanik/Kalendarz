using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKariery.Models.ViewModels
{
	public class RegisterViewModel
	{
		public RegisterModel RegisterModel { get; set; }
		public User User { get; set; }
		public Address Address {get; set;}
	}
}