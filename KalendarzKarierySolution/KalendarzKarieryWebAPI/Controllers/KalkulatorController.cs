using KalendarzKarieryWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace KalendarzKarieryWebAPI.Controllers
{
    public class KalkulatorController : ApiController
    {
        // GET api/kalkulator/5
        public string Get()
        {
            return "value";
        }

        // POST api/kalkulator
		[HttpPost]
		public object Post(KalkulatorModel model )
        {
			decimal kosztWymiany = model.stawkaRBG * model.czasWymiany + model.cenaCzesci;

			decimal stal = 1M;
			decimal aluminium = 1.4M;
			decimal stalNierdzewna = 2M;

			decimal profil = 1.35M;
			decimal panel = 1M;

			decimal krawedz = 1.22M;
			decimal przetloczenie = 1.5M;
			decimal zalamanie = 1.3M;
			decimal wzmocnienie = 1.15M;

			decimal wsplWymiany = 0M;
			decimal powierzchnia = 0M;
			decimal wsplGlebokosci = 0M;
			decimal wartoscPoczatkowaKosztuNaprawy = 0M;
			decimal wartoscKosztuNaprawyStalAlu = 0M;
			decimal wartoscUwzgledniajacaRodzajPowierzchni = 0M;
			decimal wynikBezWspUszkodzenia = 0M;
			decimal wspolczynnikUmiejscowieniaUszkodzeniaPanel = 0M;
			decimal wspolczynnikUmiejscowieniaUszkodzeniaProfil = 0M;
			decimal wynikKoncowy = 0M;

			//1. współczynnik wymiany
			wsplWymiany = kosztWymiany / 1500;

			//1.1 współczynnik umiejscowienia uszkodzenia - Panel
			if ( model.krawedz_isChecked )
			{
				wspolczynnikUmiejscowieniaUszkodzeniaPanel = krawedz;
			}
			else
			{
				wspolczynnikUmiejscowieniaUszkodzeniaPanel = 1;
			}

			if ( model.przetloczenie_isChecked )
			{
				wspolczynnikUmiejscowieniaUszkodzeniaPanel *= przetloczenie;
			}
			else
			{
				wspolczynnikUmiejscowieniaUszkodzeniaPanel *= 1;
			}

			if ( model.zalamanie_isChecked )
			{
				wspolczynnikUmiejscowieniaUszkodzeniaPanel *= zalamanie;
			}
			else
			{
				wspolczynnikUmiejscowieniaUszkodzeniaPanel *= 1;
			}

			if ( model.wzmocnienie_isChecked )
			{
				wspolczynnikUmiejscowieniaUszkodzeniaPanel *= wzmocnienie;
			}
			else
			{
				wspolczynnikUmiejscowieniaUszkodzeniaPanel *= 1;
			}


			//1.2 współczynnik umiejscowienia uszkodzenia - Profil
			if ( model.krawedz_isChecked )
			{
				wspolczynnikUmiejscowieniaUszkodzeniaProfil = krawedz;
			}
			else
			{
				wspolczynnikUmiejscowieniaUszkodzeniaProfil = 1;
			}


			//2. powierzchnia
			powierzchnia = model.szerokosc * model.wysokosc;

			//3. współczynnik Głębokości 
			wsplGlebokosci = ( model.glebokosc - .1M ) * 2.1M;

			//4. wartość początkowa kosztu naprawy
			wartoscPoczatkowaKosztuNaprawy = ( ( ( powierzchnia - 25 ) / 2.5M ) + 350 ) + wsplGlebokosci;

			//5. wartość kosztu naprawy Stal/Aluminium
			if ( model.stal_isChecked )
			{
				wartoscKosztuNaprawyStalAlu = wartoscPoczatkowaKosztuNaprawy * stal;
			}
			else if ( model.aluminium_isChecked )
			{
				wartoscKosztuNaprawyStalAlu = wartoscPoczatkowaKosztuNaprawy * aluminium;
			}
			else
			{
				wartoscKosztuNaprawyStalAlu = wartoscPoczatkowaKosztuNaprawy * stalNierdzewna;
			}

			//6. wartość uwzględniająca rodzaj powierzchni
			if ( model.profil_isChecked )
			{
				wartoscUwzgledniajacaRodzajPowierzchni = wartoscKosztuNaprawyStalAlu * profil;
			}
			else
			{
				wartoscUwzgledniajacaRodzajPowierzchni = wartoscKosztuNaprawyStalAlu * panel;
			}

			//7. wynik bez wsp. uszkodzenia
			wynikBezWspUszkodzenia = wsplWymiany * wartoscUwzgledniajacaRodzajPowierzchni;


			//8. wynik końcowy: koszt odbudowy z uwzględnieniem rodzaju i umiejscowienia uszkodzenia
			if ( model.profil_isChecked )
			{
				wynikKoncowy = wynikBezWspUszkodzenia * wspolczynnikUmiejscowieniaUszkodzeniaProfil * krawedz;
			}
			else
			{
				wynikKoncowy = wynikBezWspUszkodzenia * wspolczynnikUmiejscowieniaUszkodzeniaPanel;
			}

			return new {kosztWymiany = kosztWymiany, kosztOdbudowy = wynikKoncowy};
        }

        // PUT api/kalkulator/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/kalkulator/5
        public void Delete(int id)
        {
        }
    }
}
