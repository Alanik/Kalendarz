using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

//nie zmieniac namespace'a
namespace KalendarzKarieryData
{

	[MetadataType(typeof(Event_Validation))]
	public partial class Event
	{

	}

	public class Event_Validation
	{
		[DataType(DataType.Date, ErrorMessage = "Podana data jest nieprawidłowa.")]
		[Required(ErrorMessage = "Pole \"Data\" nie może być puste.")]
		[Display(Name = "Data:")]
		public DateTime StartDate { get; set; }

		[Display(Name = "Tytuł:")]
		[Required(ErrorMessage = "Pole \"Tytuł\" nie może być puste.")]
		public string Title { get; set; }

		[Display(Name = "Krótki opis:")]
		public string Description { get; set; }

		[Display(Name = "Szczegóły:")]
		public string Details { get; set; }

		[Display(Name = "Opłata za wstęp:")]
		[DataType(DataType.Currency, ErrorMessage="Podana kwota jest nieprawidłowa.")]
		public string Price { get; set; }

		[Display(Name = "Link:")]
		public string UrlLink { get; set; }

		[Display(Name = "Max ilość uczestników:")]
		public int OccupancyLimit { get; set; }
	}
}