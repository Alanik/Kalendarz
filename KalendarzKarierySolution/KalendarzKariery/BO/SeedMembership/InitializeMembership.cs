﻿
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
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryData.BO.Cache;
using KalendarzKarieryCore.BO;

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
			WebSecurity.InitializeDatabaseConnection( "SimpleMembership_KalendarzKarieryConnection", "User", "Id", "UserName", autoCreateTables: false );

			if (!Roles.RoleExists( AdminRole ))
			{
				Roles.CreateRole( AdminRole );
			}

			if (!WebSecurity.UserExists( AdminAlanikLogin ))
			{
				CreateAdminUser( AdminAlanikLogin );
			}

			if (!WebSecurity.UserExists( AdminLuqLogin ))
			{
				CreateAdminUser( AdminLuqLogin );
			}
		}

		private static User GetAlanikAdmin( string loginName )
		{
			User user = new User();
			Address address = new Address();
			address.Street = "Wejherowska 152/30";
			address.City = "Wroclaw";
			address.Country = "Polska";
			address.ZipCode = "54-239";

			user.Address = address;
			user.Bio = "Witam, nazywam sie Alanik i jestem adminem";
			user.BirthDay = new DateTime( 1987, 7, 30 );
			user.Email = "thealanik@aim.com";
			user.FirstName = "Alan";
			user.LastName = "Budzinski";
			user.Phone = "530176411";
			user.Gender = "m";
			user.UserName = loginName;

			user.UserAccountInfo = new UserAccountInfo();
			user.UserAccountInfo.CreationDate = DateTimeFacade.DateTimeNow();
			user.UserAccountInfo.NumOfLogins = 1;
			user.UserAccountInfo.LastLogin = DateTimeFacade.DateTimeNow();
		
			user.UserAccountInfoId = user.UserAccountInfo.Id;

			return user;
		}

		private static void CreateAdminUser( string loginName )
		{
			User user = GetAlanikAdmin( loginName );

			WebSecurity.CreateUserAndAccount( loginName, AdminPassword, propertyValues: new
			{
				Email = user.Email,
				FirstName = user.FirstName,
				LastName = user.LastName,
				Bio = user.Bio,
				BirthDay = user.BirthDay,
				UserName = user.UserName,
				Phone = user.Phone,
				Gender = user.Gender,
				Address = user.Address
			} );

			if (!Roles.GetRolesForUser( loginName ).Contains( AdminRole ))
			{
				Roles.AddUserToRole( loginName, AdminRole );
			}
		}
	}
}