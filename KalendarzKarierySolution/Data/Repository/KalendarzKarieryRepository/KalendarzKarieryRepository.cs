using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Cryptography.Pkcs;
using System.Web;
using KalendarzKarieryData.Models.ViewModels;
using System.Web.Hosting;
using System.Data.Common;
using KalendarzKarieryData.Models.TransportModels;

namespace KalendarzKarieryData.Repository.KalendarzKarieryRepository
{
	public class KalendarzKarieryRepository : IKalendarzKarieryRepository
	{
		private readonly KalendarzKarieryDBEntities _entities;

		public KalendarzKarieryRepository(bool useFakeRepository = false)
		{
			if (useFakeRepository)
			{
				var CsvFilesPath = "~/Data/FakeRepositoryCsvFiles";
				var physicalPath = HostingEnvironment.MapPath(CsvFilesPath);
				var ConnectionName = "name=KalendarzKarieryDBEntities";

				var loader = new Effort.DataLoaders.CsvDataLoader(physicalPath);
				DbConnection connection = Effort.EntityConnectionFactory.CreateTransient(ConnectionName, loader);
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
			return _entities.Users.FirstOrDefault(m => m.Id == id);
		}

		public void UpdateUserOnRegister(int id, Address address)
		{
			User currentUser = _entities.Users.FirstOrDefault(m => m.Id == id);

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
			return _entities.Users.First(m => m.UserName == name).Id;
		}

		#endregion

		#region Events

		public void AddEvent(Event @event)
		{
			_entities.Events.Add(@event);
		}

		public CalendarEventTreeModel GetEventsForGivenMonth(int month, int year)
		{

			var list = _entities.Events.Where(m => m.StartDate.Month == month).OrderBy(m => m.StartDate.Day).ThenBy(m => m.StartDate.Hour).ThenBy(m => m.StartDate.Minute);
			var transformedList = list.Select(m => new
			{
				id = m.Id,
				name = m.Title,
				description = m.Description,
				details = m.Details,
				dateAdded = m.DateAdded,
				eventLengthInMinutes = m.EventLengthInMinutes,
				occupancyLimit = m.OccupancyLimit,
				urlLink = m.UrlLink,
				calendarPlacementRow = 1,
				startDate = m.StartDate,
				numberOfPeopleAttending = m.NumberOfPeopleAttending,
				kind = new { name = m.EventKind.Name, value = m.EventKind.Value },
				privacyLevel = new { name = m.PrivacyLevel.Name, value = m.PrivacyLevel.Value },
				addresses = m.Addresses.Select(o => new { street = o.Street, city = o.City, zipCode = o.ZipCode })
			});

			var groups = transformedList.ToLookup(m => m.startDate.Day).Select( o => new EventsGroupedByDayModel(o.Key, o.ToArray())).ToArray();
		
			return new CalendarEventTreeModel(month, year, groups);
		}

		public ICollection<object> GetAllEvents()
		{
			return _entities.Events.Select(m => new
			{
				title = m.Title,
				description = m.Description,
				details = m.Details,
				dateAdded = m.DateAdded,
				eventLenghtInMinutes = m.EventLengthInMinutes,
				occupancyLimit = m.OccupancyLimit,
				urlLink = m.UrlLink,
				numberOfPeopleAttending = m.NumberOfPeopleAttending,
				kind = new { name = m.EventKind.Name, value = m.EventKind.Value },
				privacyLevel = new { name = m.PrivacyLevel.Name, value = m.PrivacyLevel.Value },
				addresses = m.Addresses.Select(o => new { street = o.Street, city = o.City, zipCode = o.ZipCode })
			}).ToArray();

		}

		public PrivacyLevel GetPrivacyLevelByValue(int value)
		{
			return _entities.PrivacyLevels.Where(m => m.Value == value).FirstOrDefault();
		}

		public ICollection<object> GetAllPrivacyLevels()
		{
			return _entities.PrivacyLevels.Select(m => new { name = m.Name, value = m.Value }).ToArray();
		}

		public EventKind GetEventKindByValue(int value)
		{
			return _entities.EventKinds.Where(m => m.Value == value).FirstOrDefault();
		}

		public ICollection<object> GetAllEventKinds()
		{
			return _entities.EventKinds.Select(m => new { name = m.Name, value = m.Value }).ToArray();
		}

		#endregion

		public void Save()
		{
			_entities.SaveChanges();
		}

	}
}