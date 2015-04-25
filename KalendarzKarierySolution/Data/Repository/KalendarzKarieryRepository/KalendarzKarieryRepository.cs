using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Cryptography.Pkcs;
using System.Web;
using KalendarzKarieryData.Models.ViewModels;
using System.Web.Hosting;
using System.Data.Common;
using KalendarzKarieryData.Models.DataTransferModels;
using KalendarzKarieryData.BO.Cache;
using System.Collections;
using KalendarzKarieryCore.BO;


namespace KalendarzKarieryData.Repository.KalendarzKarieryRepository
{
	public class KalendarzKarieryRepository : IKalendarzKarieryRepository
	{
		private readonly KalendarzKarieryDBEntities _entities;

		public KalendarzKarieryRepository( bool useFakeRepository = false )
		{
			if (useFakeRepository)
			{
				var CsvFilesPath = "~/Data/FakeRepositoryCsvFiles";
				var physicalPath = HostingEnvironment.MapPath( CsvFilesPath );
				var ConnectionName = "name=KalendarzKarieryDBEntities";

				var loader = new Effort.DataLoaders.CsvDataLoader( physicalPath );
				DbConnection connection = Effort.EntityConnectionFactory.CreateTransient( ConnectionName, loader );
				_entities = new KalendarzKarieryDBEntities( connection );

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

		public User GetUserById( int id )
		{
			return _entities.Users.Include( "Addresses" ).Include( "UserAccountInfo" ).FirstOrDefault( m => m.Id == id );
		}

		public void UpdateUserOnRegister( int id, Address address )
		{
			User currentUser = _entities.Users.FirstOrDefault( m => m.Id == id );

			if (currentUser == null)
			{
				throw new ArgumentNullException( "user", "UpdateUserOnRegister user is null" );
			}

			currentUser.Addresses.Add( address );

			currentUser.UserAccountInfo = new UserAccountInfo
			 {
				 AverageLoginTime = 0,
				 CreationDate = DateTimeFacade.DateTimeNow(),
				 LastLogin = DateTimeFacade.DateTimeNow(),
				 LastLogout = null,
				 NumOfLogins = 1,
				 TotalLoginTime = 0
			 };

			_entities.SaveChanges();
		}

		public User GetUserByEmail( string email )
		{
			return _entities.Users.Include( "Addresses" ).FirstOrDefault( m => m.Email == email );
		}

		public int? GetUserIdByName( string name )
		{
			var user = _entities.Users.FirstOrDefault( m => string.Compare( m.UserName, name, true ) == 0 );
			if (user != null)
			{
				return user.Id;
			}

			return null;
		}

		#endregion

		#region Events

		public Event GetEventById( int id )
		{
			return _entities.Events.Include( "User" ).Include( "Addresses" ).FirstOrDefault( m => m.Id == id );
		}

		public void AddEvent( Event @event )
		{
			_entities.Events.Add( @event );
		}

		public void DeleteEvent( Event @event )
		{
			_entities.Events.Remove( @event );
		}

		public ICollection<JsonEventModel> GetAllNews()
		{
			return _entities.Events.Include( "User" ).Include( "Addresses" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => m.EventKind.Value == 8 ).OrderBy( m => m.StartDate ).AsEnumerable().Select( m => new JsonEventModel( m ) ).ToArray();
		}

		//TODO: check if OrderBY is done in SQL or .NET (for var = list)
		public EventsGroupedByYearModel GetAllEventsForGivenYearByUserId( int id, int year )
		{
			var list = _entities.Events.Include( "User" ).Include( "Addresses" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => m.OwnerUserId == id && m.StartDate.Year == year ).OrderBy( m => m.StartDate ).AsEnumerable();

			var transformedList = list.Select( m => new JsonEventModel( m ) );

			var groups = transformedList.ToLookup( m => m.startDate.Month ).Select( o => new EventsGroupedByMonthModel( o.Key, o.ToArray().ToLookup( t => t.startDate.Day ).Select( l => new EventsGroupedByDayModel( l.Key, l.ToArray() ) ) ) ).ToArray();

			return new EventsGroupedByYearModel( year, groups );
		}

		public IList<EventsGroupedByYearModel> GetAllEventsByUserId( int id )
		{
			var container = new List<EventsGroupedByYearModel>();
			var years = GetYearsWhenEventsStartByUserId( id );

			foreach (int num in years)
			{
				var list = _entities.Events.Include( "User" ).Include( "Addresses" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => m.OwnerUserId == id && m.StartDate.Year == num ).OrderBy( m => m.StartDate ).AsEnumerable();

				var transformedList = list.Select( m => new JsonEventModel( m ) );

				var groups = transformedList.ToLookup( m => m.startDate.Month ).Select( o => new EventsGroupedByMonthModel( o.Key, o.ToArray().ToLookup( t => t.startDate.Day ).Select( l => new EventsGroupedByDayModel( l.Key, l.ToArray() ) ) ) ).ToArray();
				container.Add( new EventsGroupedByYearModel( num, groups ) );
			}

			return container;
		}

		public IList<EventsGroupedByYearModel> GetAllPublicEvents()
		{
			var container = new List<EventsGroupedByYearModel>();
			var years = GetYearsWhenEventsStartByPrivacyLvl( 2 );

			foreach (int num in years)
			{
				var list = _entities.Events.Include( "User" ).Include( "Addresses" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => m.StartDate.Year == num && m.PrivacyLevel.Value == 2 ).OrderBy( m => m.StartDate ).AsEnumerable();
				var transformedList = list.Select( m => new JsonEventModel( m ) );

				var groups = transformedList.ToLookup( m => m.startDate.Month ).Select( o => new EventsGroupedByMonthModel( o.Key, o.ToArray().ToLookup( t => t.startDate.Day ).Select( l => new EventsGroupedByDayModel( l.Key, l.ToArray() ) ) ) ).ToArray();

				container.Add( new EventsGroupedByYearModel( num, groups ) );
			}

			return container;
		}

		public PrivacyLevel GetPrivacyLevelByValue( int value )
		{
			return _entities.PrivacyLevels.Where( m => m.Value == value ).FirstOrDefault();
		}

		public ICollection<object> GetAllPrivacyLevels()
		{
			return _entities.PrivacyLevels.Select( m => new { name = m.Name, value = m.Value } ).ToArray();
		}

		public EventKind GetEventKindByValue( int value )
		{
			return _entities.EventKinds.Where( m => m.Value == value ).FirstOrDefault();
		}

		public ICollection<object> GetAllEventKinds()
		{
			return _entities.EventKinds.Select( m => new { name = m.Name, value = m.Value } ).OrderBy( m => m.value ).ToArray();
		}

		public ICollection<object> GetEventKindsBasedOnUserName( string name )
		{
			if (!string.IsNullOrEmpty( name ))
			{
				var user = _entities.Users.Include( "webpages_Roles" ).Where( m => string.Compare( m.UserName, name, true ) == 0 ).FirstOrDefault();

				if (user != null)
				{
					return _entities.EventKinds.Select( m => new { name = m.Name, value = m.Value } ).OrderBy( m => m.value ).ToArray();
				}
			}

			return _entities.EventKinds.Where( m => m.Value != 8 ).Select( m => new { name = m.Name, value = m.Value } ).OrderBy( m => m.value ).ToArray();
		}

		public object GetMyEventCountTree( int userId )
		{
			var now = DateTimeFacade.DateTimeNow();

			var query = from e in _entities.Events.Where( m => m.OwnerUserId == userId )
						group e by e.EventKind.Value into grp
						select new { value = grp.Key, events = new { upcoming = grp.Where( m => m.StartDate > now ).Count(), all = grp.Count() } };

			return query;
		}

		public object GetPublicEventCountTree()
		{
			var now = DateTimeFacade.DateTimeNow();

			var query = from e in _entities.Events.Where( m => m.PrivacyLevel.Value == 2 )
						group e by e.EventKind.Value into grp
						select new { value = grp.Key, events = new { upcoming = grp.Where( m => m.StartDate > now ).Count(), all = grp.Count() } };

			return query;
		}

		public int? GetEventStatusIdByValue( int value )
		{
			var status = _entities.EventStatus.Where( m => m.Value == value ).FirstOrDefault();
			if (status != null)
			{
				return status.Id;
			}
			else
			{
				return null;
			}
		}

		private int[] GetYearsWhenEventsStartByUserId( int id )
		{
			var query = from e in _entities.Events
						where e.OwnerUserId == id
						group e by e.StartDate.Year into grp
						select grp.Key;

			return query.ToArray();
		}

		private int[] GetYearsWhenEventsStartByPrivacyLvl( int value )
		{

			var query = from e in _entities.Events
						where e.PrivacyLevel.Value == value
						group e by e.StartDate.Year into grp
						select grp.Key;

			return query.ToArray();
		}

		#endregion

		public void Save()
		{
			_entities.SaveChanges();
		}
	}
}