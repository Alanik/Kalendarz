using System.ComponentModel.DataAnnotations;

//nie zmieniac namespace'a
namespace KalendarzKarieryData
{
	[MetadataType(typeof(Address_Validation))]
	public partial class Address
	{
		// leave it empty.
	}

	public class Address_Validation
	{
		//[Required(ErrorMessage = "Pole \"Ulica\" nie może być puste.")]
		[Display(Name = "Ulica")]
		public string Street { get; set; }

		//[Required(ErrorMessage = "Pole \"Miasto\" nie może być puste.")]
		[Display(Name = "Miasto")]
		public string City { get; set; }

		//[Required(ErrorMessage = "Pole \"Kod Pocztowy\" nie może być puste.")]
		[Display(Name = "Kod Pocztowy")]
		[RegularExpression(@"[0-9]{2}-[0-9]{3}", ErrorMessage = "Pole \"Kod pocztowy\" zawiera nieprawidłową wartość.")]
		public string ZipCode { get; set; }

		//[Required(ErrorMessage = "Pole \"Kraj\" nie może być puste.")]
		[Display(Name = "Kraj")]
		public string Country { get; set; }
	}
}