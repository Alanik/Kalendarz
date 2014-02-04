
using KalendarzKarieryData.Models.ViewModels;
using System.Web.Mvc;

namespace KalendarzKariery.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			return View();
		}

		[HttpPost]
		public ActionResult AddEvent(AddEventViewModel eventParam)
		{
			AddEventViewModel e = eventParam;

			return Json(new { isAddEventSuccess = true });
		}
	}
}
