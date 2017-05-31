
using System;
using System.Linq;
using System.Web.Security;
using WebMatrix.WebData;
using KalendarzKarieryData;
using KalendarzKarieryCore.BO;

namespace KalendarzKariery.BO.SeedMembership
{
    public static class InitializeMembership
	{
		const string AdminRole = "Administrator";
		const string AdminAlanikLogin = "AdminAlanik";
		const string AdminLuqLogin = "AdminLuq";
		const string AdminPassword = "admin123admin";
		const string AlanikEmail = "thealanik@aim.com";
		const string LuqEmail = "test@email.com";

		public static void SeedMembership()
		{
				WebSecurity.InitializeDatabaseConnection( "SimpleMembership_KalendarzKarieryConnection", "User", "Id", "UserName", autoCreateTables: false );


			if (!Roles.RoleExists( AdminRole ))
			{
				Roles.CreateRole( AdminRole );
			}

			if (!WebSecurity.UserExists( AdminAlanikLogin ))
			{
				CreateAdminUser( AdminAlanikLogin, AlanikEmail );
			}

			if (!WebSecurity.UserExists( AdminLuqLogin ))
			{
				CreateAdminUser( AdminLuqLogin, LuqEmail );
			}
		}

		private static User GetAdminUser( string loginName, string email )
		{
			User user = new User();

			user.Bio = "Witam, jestem adminem!";
			user.BirthDay = new DateTime( 1987, 7, 30 );
			user.Email = email;
			user.FirstName = "Alan";
			user.LastName = "Budzinski";
			user.Phone = "530176411";
			user.Gender = "m";
			user.UserName = loginName;

			user.UserAccountInfo = new UserAccountInfo();
			user.UserAccountInfo.CreateDate = DateTimeFacade.DateTimeNow();
			user.UserAccountInfo.NumOfLogins = 1;
			user.UserAccountInfo.LastLogin = DateTimeFacade.DateTimeNow();
		
			user.UserAccountInfoId = user.UserAccountInfo.Id;

			return user;
		}

		private static void CreateAdminUser( string loginName, string email )
		{
			User user = GetAdminUser( loginName, email );

			WebSecurity.CreateUserAndAccount( loginName, AdminPassword, propertyValues: new
			{
				Email = user.Email,
				FirstName = user.FirstName,
				LastName = user.LastName,
				Bio = user.Bio,
				BirthDay = user.BirthDay,
				UserName = user.UserName,
				Phone = user.Phone,
				Gender = user.Gender
			} );

			if (!Roles.GetRolesForUser( loginName ).Contains( AdminRole ))
			{
				Roles.AddUserToRole( loginName, AdminRole );
			}
		}
	}
}