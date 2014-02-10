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
		//[DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:dd/MM/yyyy}")]
		public DateTime StartDate { get; set; }

		[Display(Name = "Tytuł:")]
		[Required(ErrorMessage = "Pole \"Tytuł\" nie może być puste.")]
		public string Title { get; set; }

		[Display(Name = "Krótki opis:")]
		public string Description { get; set; }

		[Display(Name = "Szczegóły:")]
		public string Details { get; set; }
	}
}