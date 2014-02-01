using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.Pkcs;
using System.Web;

namespace KalendarzKarieryData
{
	public class KalendarzKarieryRepository : IKalendarzRepository
	{
		private readonly KalendarzKarieryDBEntities _entities;

		public KalendarzKarieryRepository()
		{
			_entities = new KalendarzKarieryDBEntities();
		}

		public User GetUserById(int id)
		{
			return _entities.Users.FirstOrDefault(m => m.UserId == id);
		}

		public void UpdateUserOnRegister(int id, Address address)
		{
			User currentUser = _entities.Users.FirstOrDefault(m => m.UserId == id);

			if (currentUser == null)
			{
				throw new ArgumentNullException("user", "UpdateUserOnRegister user is null");
			}

			currentUser.Addresses.Add(address);

			currentUser.UserAccountInfo = new UserAccountInfo
			 {
				 AverageLoginTime = 0,
				 CreationDate = DateTime.Now,
				 LastLogin = DateTime.Now,
				 LastLogout = null,
				 NumOfLogins = 1,
				 TotalLoginTime = 0
			 };

			_entities.SaveChanges();
		}

		public User GetUserByEmail(string email)
		{
			return _entities.Users.FirstOrDefault(m => m.Email == email);
		}

		public void Save()
		{
			_entities.SaveChanges();
		}

	}
}