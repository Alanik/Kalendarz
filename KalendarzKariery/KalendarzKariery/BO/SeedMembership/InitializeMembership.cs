﻿using KalendarzKariery.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Security;
using WebMatrix.WebData;

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
			WebSecurity.InitializeDatabaseConnection("KalendarzKarieryConnection", "User", "UserId", "UserName", autoCreateTables: true);

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
			address.Address1 = "Wejherowska 152/30";
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

			user.UserInfo = new UserInfo();

			user.UserInfo.CreationDate = DateTime.Now;
			user.UserInfo.NumOfLogins = 1;
			user.UserInfo.LastLogin = DateTime.Now;

			return user;
		}

		private static void CreateAdminUser(string loginName)
		{

			if (!WebSecurity.UserExists(loginName))
			{
				User user = InitializeMembership.GetAlanikAdmin(loginName);

				WebSecurity.CreateUserAndAccount(loginName, AdminPassword, propertyValues: new
				{
					Email = user.Email,
					FirstName = user.FirstName,
					LastName = user.LastName,
					Bio = user.Bio,
					BirthDay = user.BirthDay,
					UserName = user.UserName,
					Phone = user.Phone,
					Gender = user.Gender,
				});

				if (!Roles.GetRolesForUser(loginName).Contains(AdminRole))
				{
					Roles.AddUserToRole(loginName, AdminRole);
				}

				KalendarzKarieryRepository repository = new KalendarzKarieryRepository();

				int id = WebSecurity.GetUserId(loginName);
				User emptyUser = repository.GetUser(id);

				emptyUser.Addresses.Add(user.Addresses.First());
				emptyUser.UserInfo = user.UserInfo;

				repository.Save();
			}

		}
	}
}