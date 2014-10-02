
using System;
using System.Collections.Generic;
using KalendarzKarieryData;
using KalendarzKarieryData.Models.ViewModels;
using System.Web.Mvc;
using System.Collections;
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryData.BO.Cache;

namespace KalendarzKariery.Controllers
{
	public class HomeController : Controller
	{

		private static readonly IKalendarzKarieryRepository Repository = RepositoryProvider.GetRepository();

		public ActionResult Index()
		{
			if (Request.IsAjaxRequest())
			{
				return View("Index", null);
			}

			var indexViewModel = new IndexViewModel();
			//indexViewModel.MyEvents = Repository.GetEventsForGivenMonth(DateTime.Today.Month, DateTime.Today.Year);

			indexViewModel.PublicEvents = null;
			indexViewModel.EventKinds = Repository.GetAllEventKinds();
			indexViewModel.PrivacyLevels = Repository.GetAllPrivacyLevels();
			

			if (User.Identity.IsAuthenticated)
			{
				indexViewModel.MyEvents = Repository.GetAllEventsByUserId(User.Identity.Name);
				indexViewModel.MyEventsCountTree = Repository.GetMyEventsCountTree();
			}
			else
			{
				indexViewModel.MyEvents = null;
				indexViewModel.MyEventsCountTree = null;
			}

			return View("Index", indexViewModel);
		}

		//[HttpPost]
		//public ActionResult AddEvent(AddEventViewModel eventParam)
		//{
		//	return Json(new { isAddEventSuccess = true });
		//}
	}
}
