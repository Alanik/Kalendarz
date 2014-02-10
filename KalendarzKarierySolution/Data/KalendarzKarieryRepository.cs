using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.Pkcs;
using System.Web;
using KalendarzKarieryData.Models.ViewModels;

namespace KalendarzKarieryData
{
	public class KalendarzKarieryRepository : IKalendarzKarieryRepository
	{
		private readonly KalendarzKarieryDBEntities _entities;

		public KalendarzKarieryRepository()
		{
			_entities = new KalendarzKarieryDBEntities();
		}

		#region User

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

		public int GetUserIdByName(string name)
		{
			return _entities.Users.First(m => m.UserName == name).UserId;
		}

		#endregion

		#region Events

		public void AddEvent(Event @event)
		{
			_entities.Events.Add(@event);
		}

		public IList<Event> GetEventsForGivenMonth(int month)
		{
			_entities.Configuration.ProxyCreationEnabled = false;
			IList<Event> list = _entities.Events.Where(m => m.StartDate.Month == month).ToList();
			return list;
		}

		#endregion

		public void Save()
		{
			_entities.SaveChanges();
		}

	}
}