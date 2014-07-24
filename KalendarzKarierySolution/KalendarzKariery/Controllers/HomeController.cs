
using System;
using System.Collections.Generic;
using KalendarzKarieryData;
using KalendarzKarieryData.Models.ViewModels;
using System.Web.Mvc;
using System.Collections;
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;

namespace KalendarzKariery.Controllers
{
	public class HomeController : Controller
	{
		private static readonly IKalendarzKarieryRepository Repository = new KalendarzKarieryRepository(); 
		
		public ActionResult Index()
		{
			if (Request.IsAjaxRequest())
			{
				return View("Index", null);
			}

			var indexViewModel = new IndexViewModel();

			indexViewModel.PrivateEvents = Repository.GetEventsForGivenMonth(DateTime.Today.Month);
			indexViewModel.PublicEvents = null;

			return View("Index", (object)JsonConvert.SerializeObject(indexViewModel, new JsonSerializerSettings()
			{
				ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
			}));
		}

		[HttpPost]
		public ActionResult AddEvent(AddEventViewModel eventParam)
		{
			AddEventViewModel e = eventParam;

			return Json(new { isAddEventSuccess = true });
		}
	}
}
