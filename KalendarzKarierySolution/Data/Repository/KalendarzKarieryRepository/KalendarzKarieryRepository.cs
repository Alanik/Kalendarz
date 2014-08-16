using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Cryptography.Pkcs;
using System.Web;
using KalendarzKarieryData.Models.ViewModels;
using System.Web.Hosting;
using System.Data.Common;

namespace KalendarzKarieryData.Repository.KalendarzKarieryRepository
{
	public class KalendarzKarieryRepository : IKalendarzKarieryRepository
	{
		private const string CsvFilesPath = "~/Data/FakeRepositoryCsvFiles";
		private string physicalPath = HostingEnvironment.MapPath(CsvFilesPath);
		private const string ConnectionName = "name=KalendarzKarieryDBEntities";

		private readonly KalendarzKarieryDBEntities _entities;

		public KalendarzKarieryRepository(bool useFakeRepository = false)
		{
			if (useFakeRepository)
			{
				var loader = new Effort.DataLoaders.CsvDataLoader(physicalPath);
				DbConnection connection =
			Effort.EntityConnectionFactory.CreateTransient(ConnectionName, loader);
				_entities = new KalendarzKarieryDBEntities(connection);
			}
			else
			{
				_entities = new KalendarzKarieryDBEntities();
			}

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
			//_entities.Configuration.ProxyCreationEnabled = false;

			IQueryable<Event> list = _entities.Events.Where(m => m.StartDate.Month == month);

			foreach (Event @event in list)
			{
				int id = @event.EventId;
				IQueryable<Address> addressList = _entities.Addresses.Where(m => m.EventId == id);
				foreach (Address address in addressList)
				{
					@event.Addresses.Add(address);
				}
			}

			return list.ToList();
		}

		public IList<Event> GetAllEvents()
		{
			return _entities.Events.ToList();
		}

		#endregion

		public void Save()
		{
			_entities.SaveChanges();
		}

	}
}