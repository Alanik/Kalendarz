using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Models.TransportModels
{
	public class JsonEventModel
	{

		public int id { get; set; }
		public string name { get; set; }
		public string addedBy { get; set; }
		public string description { get; set; }
		public string details { get; set; }
		public DateTime dateAdded { get; set; }
		public int? occupancyLimit { get; set; }
		public string urlLink { get; set; }
		public int calendarPlacementRow { get; set; }
		public DateTime startDate { get; set; }
		public DateTime? endDate { get; set; }
		public int numberOfPeopleAttending { get; set; }
		public object kind { get; set; }
		public decimal price { get; set; }
		public object privacyLevel { get; set; }
		public object addresses { get; set; }

		public JsonEventModel()
		{
			
		}
	}
}
