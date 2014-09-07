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
using KalendarzKarieryData.BO.Cache;

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

				//nie kasowac tego komentarza
				//		public KalendarzKarieryDBEntities(DbConnection connection)
				//		: base(connection, true)
				//		{

				//TODO: use lazy or eager loading?
				//this.Configuration.LazyLoadingEnabled = false;

				//		}

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
			var user = _entities.Users.FirstOrDefault(m => string.Compare(m.UserName, name, true) == 0);
			if (user != null)
			{
				return user.Id;
			}

			return -1;
		}

		#endregion

		#region Events

		public Event GetEventById(int id)
		{
			return _entities.Events.Include(u => u.User).FirstOrDefault(m => m.Id == id);
		}

		public void AddEvent(Event @event)
		{
			_entities.Events.Add(@event);
		}

		public void DeleteEvent(Event @event)
		{
			_entities.Events.Remove(@event);
		}

		public IList<Event> GetAllEvents()
		{
			return _entities.Events.ToList();
		}

		//public CalendarEventTreeModel GetAllEventsForGivenMonthByUserId(string userName, int month, int year)
		//{

		//	var list = _entities.Events.Where(m => m.StartDate.Month == month).OrderBy(m => m.StartDate.Day).ThenBy(m => m.StartDate.Hour).ThenBy(m => m.StartDate.Minute);
		//	var transformedList = list.Select(m => new
		//	{
		//		id = m.Id,
		//		name = m.Title,
		//		description = m.Description,
		//		details = m.Details,
		//		dateAdded = m.DateAdded,
		//		eventLengthInMinutes = m.EventLengthInMinutes,
		//		occupancyLimit = m.OccupancyLimit,
		//		urlLink = m.UrlLink,
		//		calendarPlacementRow = 1,
		//		startDate = m.StartDate,
		//		numberOfPeopleAttending = m.NumberOfPeopleAttending,
		//		kind = new { name = m.EventKind.Name, value = m.EventKind.Value },
		//		privacyLevel = new { name = m.PrivacyLevel.Name, value = m.PrivacyLevel.Value },
		//		addresses = m.Addresses.Select(o => new { street = o.Street, city = o.City, zipCode = o.ZipCode })
		//	});

		//	var groups = transformedList.ToLookup(m => m.startDate.Day).Select(o => new EventsGroupedByDayModel(o.Key, o.ToArray())).ToArray();

		//	return new CalendarEventTreeModel(year, groups);
		//}

		public CalendarEventTreeModel GetAllEventsForGivenYearByUserId(string userName, int year)
		{
			int id;

			var objectId = AppCache.Get(userName.ToLower());
			if (objectId != null)
			{
				id = (int)objectId;
			}
			else
			{
				var user = _entities.Users.Where(m => string.Compare(m.UserName, userName, true) == 0).FirstOrDefault();
				if (user != null)
				{
					id = user.Id;
					AppCache.Set(userName.ToLower(), id);
				}
				else
				{
					return null;
				}
			}

			var list = _entities.Events.Where(m => m.OwnerUserId == id && m.StartDate.Year == year).OrderBy(m => m.StartDate.Month).ThenBy(m => m.StartDate.Day).ThenBy(m => m.StartDate.Hour).ThenBy(m => m.StartDate.Minute);
			var transformedList = list.Select(m => new
			{
				id = m.Id,
				name = m.Title,
				description = m.Description,
				details = m.Details,
				dateAdded = m.DateAdded,
				occupancyLimit = m.OccupancyLimit,
				urlLink = m.UrlLink,
				calendarPlacementRow = 1,
				startDate = m.StartDate,
				endDate = m.EndDate,
				numberOfPeopleAttending = m.NumberOfPeopleAttending,
				kind = new { name = m.EventKind.Name, value = m.EventKind.Value },
				privacyLevel = new { name = m.PrivacyLevel.Name, value = m.PrivacyLevel.Value },
				addresses = m.Addresses.Select(o => new { street = o.Street, city = o.City, zipCode = o.ZipCode })
			});

			var groups = transformedList.ToLookup(m => m.startDate.Month).Select(o => new EventsGroupedByMonthModel(o.Key, o.ToArray().ToLookup(t => t.startDate.Day).Select(l => new EventsGroupedByDayModel(l.Key, l.ToArray())))).ToArray();

			return new CalendarEventTreeModel(year, groups);
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