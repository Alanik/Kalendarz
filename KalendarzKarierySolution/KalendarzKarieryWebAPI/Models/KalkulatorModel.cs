using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKarieryWebAPI.Models
{
	public class KalkulatorModel
	{
		public decimal stawkaRBG {get; set;}
		public decimal czasWymiany {get; set;}
		public decimal cenaCzesci {get; set;}
		public decimal szerokosc {get; set;}
		public decimal wysokosc {get; set;}
		public decimal glebokosc {get; set;}
		public bool stal_isChecked {get; set;}
		public bool aluminium_isChecked {get; set;}
		public bool stalNierdzewna_isChecked {get; set;}
		public bool profil_isChecked {get; set;}
		public bool panel_isChecked {get; set;}
		public bool krawedz_isChecked {get; set;}
		public bool przetloczenie_isChecked {get; set;}
		public bool zalamanie_isChecked {get; set;}
		public bool wzmocnienie_isChecked {get; set;}
	}
}