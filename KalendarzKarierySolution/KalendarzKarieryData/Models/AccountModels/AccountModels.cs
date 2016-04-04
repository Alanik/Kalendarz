using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace KalendarzKarieryData.Models.AccountModels
{
    public class UsersContext : DbContext
	{
		public UsersContext()
			: base("KalendarzKarieryDBEntities")
		{
		}

		public DbSet<UserProfile> UserProfiles { get; set; }
	}

	[Table("UserProfile")]
	public class UserProfile
	{
		[Key]
		[DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
		public int UserId { get; set; }
		public string UserName { get; set; }
	}

	public class RegisterExternalLoginModel
	{
		[Required]
		[Display(Name = "User name")]
		public string UserName { get; set; }

		public string ExternalLoginData { get; set; }
	}

	public class LocalPasswordModel
	{
		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "Current password")]
		public string OldPassword { get; set; }

		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "New password")]
		public string NewPassword { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Confirm new password")]
		[Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }
	}

	public class LoginModel
	{
		[Required(ErrorMessage = "Pole \"Nazwa użytkownika\" nie może być puste.")]
		[Display(Name = "Nazwa użytkownika")]
		public string UserName { get; set; }

		[Required(ErrorMessage = "Pole \"Hasło\" nie może być puste.")]
		[DataType(DataType.Password)]
		[Display(Name = "Hasło")]
		public string Password { get; set; }

		[Display(Name = "Zapamiętaj mnie?")]
		public bool RememberMe { get; set; }
	}

	public class RegisterModel
	{
		[Required(ErrorMessage = "Pole \"Nazwa użytkownika\" nie może być puste.")]
		[Display(Name = "Nazwa użytkownika")]
		public string UserName { get; set; }

		[Required(ErrorMessage="Pole \"Hasło\" nie może być puste.")]
		[StringLength(100, ErrorMessage = "Pole {0} musi posiadać przynajmniej {2} znaków.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "Hasło")]
		public string Password { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Potwierdź hasło")]
		[Compare("Password", ErrorMessage = "Pole \"Hasło\" oraz pole \"Potwierdź hasło\" muszą posiadać tą samą wartość.")]
		public string ConfirmPassword { get; set; }
	
	}

	public class ExternalLogin
	{
		public string Provider { get; set; }
		public string ProviderDisplayName { get; set; }
		public string ProviderUserId { get; set; }
	}

}
