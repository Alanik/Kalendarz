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
using System.Collections;

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
			return _entities.Events.Include("User").FirstOrDefault(m => m.Id == id);
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

		public EventsGroupedByYearModel GetAllEventsForGivenYearByUserId(string userName, int year)
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

			return new EventsGroupedByYearModel(year, groups);
		}

		public IList<EventsGroupedByYearModel> GetAllEventsByUserId(string userName)
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

			var container = new List<EventsGroupedByYearModel>();
			var years = GetYearsWhenEventsStart(id);

			foreach (int num in years)
			{

				var list = _entities.Events.Where(m => m.OwnerUserId == id && m.StartDate.Year == num).OrderBy(m => m.StartDate.Year).ThenBy(m => m.StartDate.Month).ThenBy(m => m.StartDate.Day).ThenBy(m => m.StartDate.Hour).ThenBy(m => m.StartDate.Minute);
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

				container.Add(new EventsGroupedByYearModel(num, groups));
			}

			return container;
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
			return _entities.EventKinds.Select(m => new { name = m.Name, value = m.Value }).OrderBy(m => m.value).ToArray();
		}

		public object GetMyEventsCountTree()
		{

			var query = from e in _entities.Events
						group e by e.EventKind.Value into grp
						select new { value = grp.Key, events = new { upcoming = grp.Where(m => m.StartDate > DateTime.Now).Count(), all = grp.Count() } };

			return query;
		}

		#endregion

		public void Save()
		{
			_entities.SaveChanges();
		}

		private int[] GetYearsWhenEventsStart(int id)
		{

			var query = from e in _entities.Events
						where e.OwnerUserId == id
						group e by e.StartDate.Year into grp
						select grp.Key;

			return query.ToArray();
		}
	}
}