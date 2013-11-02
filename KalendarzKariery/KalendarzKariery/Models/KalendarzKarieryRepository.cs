﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKariery.Models
{
	public class KalendarzKarieryRepository
	{

		KalendarzKarieryDBEntities entities = new KalendarzKarieryDBEntities();

		public User GetUser(int id)
		{
			return entities.Users.FirstOrDefault(m => m.UserId == id);
		}

		public void UpdateUserOnRegiser(int id, Address address)
		{
			User currentUser = entities.Users.FirstOrDefault(m => m.UserId == id);

			currentUser.Addresses.Add(address);

			UserInfo currentUserInfo = new UserInfo() { AverageLoginTime = 0, CreationDate = DateTime.Now, LastLogin = DateTime.Now, LastLogout = null, NumOfLogins = 1, TotalLoginTime = 0 };

			currentUser.UserInfo = currentUserInfo;

			entities.SaveChanges();
		}

		public User GetUserByEmail(string email)
		{
			return entities.Users.FirstOrDefault(m => m.Email == email);
		}

		public void Save()
		{
			entities.SaveChanges();
		}

	}
}