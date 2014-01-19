
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity.Migrations.Infrastructure;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;
using System.Web.Security;
using WebMatrix.WebData;
using KalendarzKarieryData;

namespace KalendarzKariery.BO.SeedMembership
{
	public static class InitializeMembership
	{
		const string AdminRole = "Administrator";
		const string AdminAlanikLogin = "AdminAlanik";
		const string AdminLuqLogin = "AdminLuq";
		const string AdminPassword = "admin123admin";

		public static void SeedMembership()
		{
			WebSecurity.InitializeDatabaseConnection("SimpleMembership_KalendarzKarieryConnection", "User", "UserId", "UserName", autoCreateTables: true);

			if (!Roles.RoleExists(AdminRole))
			{
				Roles.CreateRole(AdminRole);
			}

			CreateAdminUser(AdminAlanikLogin);
			CreateAdminUser(AdminLuqLogin);
		}

		private static User GetAlanikAdmin(string loginName)
		{
			User user = new User();
			Address address = new Address();
			address.Street = "Wejherowska 152/30";
			address.City = "Wroclaw";
			address.Country = "Polska";
			address.ZipCode = "54-239";

			user.Addresses.Add(address);
			user.Bio = "Witam, nazywam sie Alanik i jestem adminem";
			user.BirthDay = new DateTime(1987, 7, 30);
			user.Email = "thealanik@aim.com";
			user.FirstName = "Alan";
			user.LastName = "Budzinski";
			user.Phone = "530176411";
			user.Gender = "m";
			user.UserName = loginName;

			user.UserAccountInfo = new UserAccountInfo();
			user.UserAccountInfo.CreationDate = DateTime.Now;
			user.UserAccountInfo.NumOfLogins = 1;
			user.UserAccountInfo.LastLogin = DateTime.Now;

			user.UserAccountInfoId = user.UserAccountInfo.UserAccountInfoId;

			return user;
		}

		private static void CreateAdminUser(string loginName)
		{

			if (!WebSecurity.UserExists(loginName))
			{
				User user = GetAlanikAdmin(loginName);

				WebSecurity.CreateUserAndAccount(loginName, AdminPassword, propertyValues: new
				{
					Email = user.Email,
					FirstName = user.FirstName,
					LastName = user.LastName,
					Bio = user.Bio,
					BirthDay = user.BirthDay,
					UserName = user.UserName,
					Phone = user.Phone,
					Gender = user.Gender
				});

				if (!Roles.GetRolesForUser(loginName).Contains(AdminRole))
				{
					Roles.AddUserToRole(loginName, AdminRole);
				}

				var repository = new KalendarzKarieryRepository();

				int id = WebSecurity.GetUserId(loginName);
				 repository.UpdateUserOnRegiser(id, user.Addresses.First()); 
			}

		}
	}
}