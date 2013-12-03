﻿using KalendarzKariery.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using KalendarzKariery.Models.ViewModels;

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
