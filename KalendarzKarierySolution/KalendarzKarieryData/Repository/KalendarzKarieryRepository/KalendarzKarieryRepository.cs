using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Cryptography.Pkcs;
using System.Web;
using KalendarzKarieryData.Models.ViewModels;
using System.Web.Hosting;
using System.Data.Common;
using KalendarzKarieryData.Models.DataTransferModels.Events;
using KalendarzKarieryData.BO.Cache;
using System.Collections;
using KalendarzKarieryCore.BO;
using KalendarzKarieryData.Models.DataTransferModels.Notes;


namespace KalendarzKarieryData.Repository.KalendarzKarieryRepository
{
	public class KalendarzKarieryRepository : IKalendarzKarieryRepository
	{
		#region User

		public User GetUserById( int id )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.Users.Include( "Address" ).Include( "UserAccountInfo" ).FirstOrDefault( m => m.Id == id );
			}
		}

		public User GetUserByEmail( string email )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.Users.Include( "Address" ).FirstOrDefault( m => m.Email == email );
			}
		}

		public int? GetUserIdByName( string name )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var user = context.Users.FirstOrDefault( m => m.UserName.Equals( name, StringComparison.InvariantCultureIgnoreCase ) );

				if (user != null)
				{
					return user.Id;
				}

				return null;
			}
		}

		public User GetUserByName( string name )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.Users.Include( "Address" ).Include( "UserAccountInfo" ).FirstOrDefault( m => m.UserName.ToLower() == name.ToLower() );
			}
		}

		public void UpdateUser( User user, Address address )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				if (user.AddressId.HasValue)
				{
					if (address == null)
					{
						context.Addresses.Attach( user.Address );
						context.Entry( user.Address ).State = EntityState.Deleted;
					}
					else
					{
						user.Address = address;
						context.Addresses.Attach( user.Address );
						context.Entry( user.Address ).State = EntityState.Modified;
					}
				}
				else
				{
					if (address != null)
					{
						user.Address = address;
						context.Addresses.Attach( user.Address );
						context.Entry( user.Address ).State = EntityState.Added;
					}
				}

				context.Users.Attach( user );
				context.Entry( user ).State = EntityState.Modified;
				context.SaveChanges();
			}
		}

		public void UpdateUserAfterRegistration( User user, Address address )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				if (address != null)
				{
					user.Address = address;
					context.Addresses.Attach( user.Address );
					context.Entry( user.Address ).State = EntityState.Added;
				}

				user.UserAccountInfo = new UserAccountInfo
				{
					AverageLoginTime = 0,
					CreationDate = DateTimeFacade.DateTimeNow(),
					LastLogin = DateTimeFacade.DateTimeNow(),
					LastLogout = null,
					NumOfLogins = 1,
					TotalLoginTime = 0
				};

				context.UserAccountInfoes.Attach( user.UserAccountInfo );
				context.Entry( user.UserAccountInfo ).State = EntityState.Added;

				context.Users.Attach( user );
				context.Entry( user ).State = EntityState.Modified;

				context.SaveChanges();
			}
		}

		public void UpdateUserAccountInfo( UserAccountInfo info )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				context.UserAccountInfoes.Attach( info );
				context.Entry( info ).State = EntityState.Modified;
				context.SaveChanges();
			}
		}

		#endregion

	#region Event

		public Event GetEventById( int id )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.Events.Include( "User" ).Include( "Address" ).FirstOrDefault( m => m.Id == id );
			}
		}

		public void AddEvent( Event @event, Address address )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				if (address != null)
				{
					@event.Address = address;
					context.Addresses.Attach( address );
					context.Entry( address ).State = EntityState.Added;
				}

				context.Events.Attach( @event );
				context.Entry( @event ).State = EntityState.Added;

				context.SaveChanges();
			}
		}

		public void UpdateEvent( Event @event, Address address)
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				if (@event.AddressId.HasValue)
				{
					if (address == null)
					{
						context.Addresses.Attach( address );
						context.Entry( address ).State = EntityState.Deleted;
					}
					else
					{
						context.Addresses.Attach( address );
						context.Entry( address ).State = EntityState.Modified;
					}
				}
				else
				{
					if (address != null)
					{
						@event.Address = address;
						context.Addresses.Attach( address );
						context.Entry( address ).State = EntityState.Added;
					}
				}

				context.Events.Attach( @event );
				context.Entry( @event ).State = EntityState.Modified;
				context.SaveChanges();
			}
		}

		public void DeleteEvent( Event @event, Address address )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				context.Events.Attach( @event );
				context.Entry( @event ).State = EntityState.Deleted;

				if (address != null)
				{
					context.Addresses.Attach(address);
				    context.Entry( address ).State = EntityState.Deleted;
				}
				
				context.SaveChanges();
			}
		}

		public ICollection<JsonEventModel> GetAllNews()
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.Events.Include( "User" ).Include( "Address" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => m.EventKind.Value == 8 ).OrderBy( m => m.StartDate ).AsEnumerable().Select( m => new JsonEventModel( m, null ) ).ToArray();
			}
		}

		public bool AddExistingEventToUserCalendar( int eventId, string username )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var @event = context.Events.FirstOrDefault( m => m.Id == eventId );
				var user = context.Users.FirstOrDefault( m => m.UserName.Equals( username, StringComparison.InvariantCultureIgnoreCase ) );

				if (@event != null && user != null)
				{
					user.ForeignEventsInCalendar.Add( @event );
					context.SaveChanges();
					return true;
				}
			}
			return false;
		}

		public bool SignUpUserForEvent( int eventId, string username )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var @event = context.Events.FirstOrDefault( m => m.Id == eventId );
				var user = context.Users.FirstOrDefault( m => m.UserName.Equals( username, StringComparison.InvariantCultureIgnoreCase ) );

				if (@event != null && user != null)
				{
					//TODO: add transaction here
					@event.SignedUpUsers.Add( user );

					if (user.Id != @event.OwnerUserId && !@event.CalendarUsers.Contains( user ))
					{
						user.ForeignEventsInCalendar.Add( @event );
					}

					context.SaveChanges();
					return true;
				}
			}

			return false;
		}

		//TODO: check if OrderBY is done in SQL or .NET (for var = list)
		public EventsGroupedByYearModel GetAllEventsConnectedToUserIdForGivenYear( int id, int year )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var list = context.Events.Include( "User" ).Include( "Address" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => (m.OwnerUserId == id || m.CalendarUsers.Any( o => o.Id == id )) && m.StartDate.Year == year ).OrderBy( m => m.StartDate ).AsEnumerable();

				var transformedList = list.Select( m => new JsonEventModel( m, id ) );

				var groups = transformedList.ToLookup( m => m.startDate.month ).Select( o => new EventsGroupedByMonthModel( o.Key, o.ToArray().ToLookup( t => t.startDate.day ).Select( l => new EventsGroupedByDayModel( l.Key, l.ToArray() ) ) ) ).ToArray();

				return new EventsGroupedByYearModel( year, groups );
			}
		}

		public IList<EventsGroupedByYearModel> GetAllEventsConnectedToUserId( int id )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var container = new List<EventsGroupedByYearModel>();
				var years = GetYearsWhenEventsStartByUserId( id );

				foreach (int num in years)
				{
					var list = context.Events.Include( "User" ).Include( "Address" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => (m.OwnerUserId == id || m.CalendarUsers.Any( o => o.Id == id )) && m.StartDate.Year == num ).OrderBy( m => m.StartDate ).AsEnumerable();

					var transformedList = list.Select( m => new JsonEventModel( m, id ) );

					var groups = transformedList.ToLookup( m => m.startDate.month ).Select( o => new EventsGroupedByMonthModel( o.Key, o.ToArray().ToLookup( t => t.startDate.day ).Select( l => new EventsGroupedByDayModel( l.Key, l.ToArray() ) ) ) ).ToArray();
					container.Add( new EventsGroupedByYearModel( num, groups ) );
				}

				return container;
			}
		}

		public IList<EventsGroupedByYearModel> GetAllEventsCreatedByUserId( int id )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var container = new List<EventsGroupedByYearModel>();
				var years = GetYearsWhenEventsStartByUserId( id );

				foreach (int num in years)
				{
					var list = context.Events.Include( "User" ).Include( "Address" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => m.OwnerUserId == id && m.StartDate.Year == num ).OrderBy( m => m.StartDate ).AsEnumerable();

					var transformedList = list.Select( m => new JsonEventModel( m, id ) );

					var groups = transformedList.ToLookup( m => m.startDate.month ).Select( o => new EventsGroupedByMonthModel( o.Key, o.ToArray().ToLookup( t => t.startDate.day ).Select( l => new EventsGroupedByDayModel( l.Key, l.ToArray() ) ) ) ).ToArray();
					container.Add( new EventsGroupedByYearModel( num, groups ) );
				}

				return container;
			}
		}

		public IList<EventsGroupedByYearModel> GetAllPublicEvents( int? userId )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var container = new List<EventsGroupedByYearModel>();
				var years = GetYearsWhenEventsStartByPrivacyLvl( 2 );

				foreach (int num in years)
				{
					var list = context.Events.Include( "User" ).Include( "Address" ).Include( "EventKind" ).Include( "PrivacyLevel" ).Where( m => m.StartDate.Year == num && m.PrivacyLevel.Value == 2 ).OrderBy( m => m.StartDate ).AsEnumerable();
					var transformedList = list.Select( m => new JsonEventModel( m, userId ) );

					var groups = transformedList.ToLookup( m => m.startDate.month ).Select( o => new EventsGroupedByMonthModel( o.Key, o.ToArray().ToLookup( t => t.startDate.day ).Select( l => new EventsGroupedByDayModel( l.Key, l.ToArray() ) ) ) ).ToArray();

					container.Add( new EventsGroupedByYearModel( num, groups ) );
				}

				return container;
			}
		}

		public PrivacyLevel GetPrivacyLevelByValue( int value )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.PrivacyLevels.Where( m => m.Value == value ).FirstOrDefault();
			}
		}

		public ICollection<object> GetAllPrivacyLevels()
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.PrivacyLevels.Select( m => new { name = m.Name, value = m.Value } ).ToArray();
			}
		}

		public EventKind GetEventKindByValue( int value )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.EventKinds.Where( m => m.Value == value ).FirstOrDefault();
			}
		}

		public ICollection<object> GetAllEventKinds()
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.EventKinds.Select( m => new { name = m.Name, value = m.Value } ).OrderBy( m => m.value ).ToArray();
			}
		}

		public ICollection<object> GetEventKindsBasedOnUserName( string name )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				if (!string.IsNullOrEmpty( name ))
				{
					var user = context.Users.Include( "webpages_Roles" ).Where( m => string.Compare( m.UserName, name, true ) == 0 ).FirstOrDefault();
					if (user != null && user.webpages_Roles.Where( m => m.RoleId == 1 ).FirstOrDefault() != null)
					{
						return context.EventKinds.Select( m => new { name = m.Name, value = m.Value } ).OrderBy( m => m.value ).ToArray();
					}
				}

				return context.EventKinds.Where( m => m.Value != 8 ).Select( m => new { name = m.Name, value = m.Value } ).OrderBy( m => m.value ).ToArray();
			}
		}

		public object GetMyEventCountTree( int userId )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var now = DateTimeFacade.DateTimeNow();

				var query = from e in context.Events.Where( m => m.OwnerUserId == userId || m.CalendarUsers.Any( o => o.Id == userId ) )
							group e by e.EventKind.Value into grp
							select new { value = grp.Key, events = new { upcoming = grp.Where( m => m.EndDate.HasValue && m.EndDate > now ).Count(), old = grp.Where( m => m.EndDate.HasValue && m.EndDate <= now ).Count() } };

				return query.ToArray();
			}
		}

		public object GetPublicEventCountTree()
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var now = DateTimeFacade.DateTimeNow();

				var query = from e in context.Events.Where( m => m.PrivacyLevel.Value == 2 )
							group e by e.EventKind.Value into grp
							select new { value = grp.Key, events = new { upcoming = grp.Where( m => m.EndDate.HasValue && m.EndDate > now ).Count(), old = grp.Where( m => m.EndDate.HasValue && m.EndDate <= now ).Count() } };

				return query.ToArray();
			}
		}

		public int? GetEventStatusIdByValue( int value )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var status = context.EventStatus.Where( m => m.Value == value ).FirstOrDefault();
				if (status != null)
				{
					return status.Id;
				}
				else
				{
					return null;
				}
			}
		}

		private int[] GetYearsWhenEventsStartByUserId( int id )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var query = from e in context.Events
							where e.OwnerUserId == id || e.CalendarUsers.Any( o => o.Id == id )
							group e by e.StartDate.Year into grp
							select grp.Key;

				return query.ToArray();
			}
		}

		private int[] GetYearsWhenEventsStartByPrivacyLvl( int value )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var query = from e in context.Events
							where e.PrivacyLevel.Value == value
							group e by e.StartDate.Year into grp
							select grp.Key;

				return query.ToArray();
			}
		}

		#endregion	

		#region Note

		public IList<NotesGroupedByYearModel> GetNotesByUserId( int id )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var container = new List<NotesGroupedByYearModel>();
				var years = this.GetYearsOfNotesDisplayDateByUserId( id );

				foreach (int num in years)
				{
					var list = context.Notes.Where( m => m.DisplayDate.Year == num && m.OwnerUserId == id ).OrderByDescending( m => m.DateAdded ).AsEnumerable();
					var transformedList = list.Select( m => new JsonNoteModel( m ) );

					var groups = transformedList.ToLookup( m => m.displayDate.month ).Select( o => new NotesGroupedByMonthModel( o.Key, o.ToArray().ToLookup( t => t.displayDate.day ).Select( l => new NotesGroupedByDayModel( l.Key, l.ToArray() ) ) ) ).ToArray();

					container.Add( new NotesGroupedByYearModel( num, groups ) );
				}

				return container;
			}
		}

		public void AddNote( Note note )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				context.Notes.Attach( note );
				context.Entry( note ).State = EntityState.Added;
				context.SaveChanges();
			}
		}

		public void DeleteNote( Note note )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				context.Notes.Attach( note );
				context.Entry( note ).State = EntityState.Deleted;
				context.SaveChanges();
			}
		}

		public void UpdateNote( Note note )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				context.Notes.Attach( note );
				context.Entry( note ).State = EntityState.Modified;
				context.SaveChanges();
			}
		}

		public Note GetNoteById( int id )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				return context.Notes.Include( "User" ).FirstOrDefault( m => m.Id == id );
			}
		}

		private int[] GetYearsOfNotesDisplayDateByUserId( int id )
		{
			using (var context = new KalendarzKarieryDBEntities())
			{
				var query = from n in context.Notes
							where n.OwnerUserId == id
							group n by n.DisplayDate.Year into grp
							select grp.Key;

				return query.ToArray();
			}
		}

		#endregion
	}
}