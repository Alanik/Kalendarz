using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.DataTransferModels
{
	[Serializable]
	public class JsonEventModel
	{
		public int id { get; set; }
		public string name { get; set; }
		public string addedBy { get; set; }
		public string description { get; set; }
		public string details { get; set; }
		public JsonDateTimeModel dateAdded { get; set; }
		public int? occupancyLimit { get; set; }
		public string urlLink { get; set; }
		public int calendarPlacementRow { get; set; }
		public JsonDateTimeModel startDate { get; set; }
		public JsonDateTimeModel endDate { get; set; }
		public int numberOfPeopleAttending { get; set; }
		public object kind { get; set; }
		public decimal price { get; set; }
		public object privacyLevel { get; set; }
		public object address { get; set; }

		public JsonEventModel( Event m )
		{		
				id = m.Id;
				name = m.Title;
				addedBy = m.User.UserName;
				description = m.Description;
				details = m.Details;
				dateAdded = new JsonDateTimeModel(m.DateAdded);
				occupancyLimit = m.OccupancyLimit;
				urlLink = m.UrlLink;
				startDate = new JsonDateTimeModel(m.StartDate);
				endDate = m.EndDate.HasValue ? new JsonDateTimeModel(m.EndDate.Value) : null;
				numberOfPeopleAttending = m.NumberOfPeopleAttending ?? 0;
				kind = new { name = m.EventKind.Name, value = m.EventKind.Value };
				price = m.Price ?? 0;
				privacyLevel = new { name = m.PrivacyLevel.Name, value = m.PrivacyLevel.Value };
				address = m.Address != null ? new { street = m.Address.Street, city = m.Address.City, zipCode = m.Address.ZipCode } : new { street = "", city = "", zipCode = "" };		
		}
	}
}
