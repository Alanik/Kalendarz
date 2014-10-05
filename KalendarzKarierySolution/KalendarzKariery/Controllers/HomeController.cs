
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
			indexViewModel.PublicEvents = Repository.GetAllPublicEvents();
			indexViewModel.EventKinds = Repository.GetAllEventKinds();
			indexViewModel.PrivacyLevels = Repository.GetAllPrivacyLevels();
			indexViewModel.PublicEventCountTree = Repository.GetPublicEventCountTree();

			indexViewModel.MyEvents = null;
			indexViewModel.MyEventCountTree = null;

			if (User.Identity.IsAuthenticated)
			{
				int id;
				string userName = User.Identity.Name.ToLower();

				var objectId = AppCache.Get(userName);
				if (objectId != null)
				{
					id = (int)objectId;

					indexViewModel.MyEvents = Repository.GetAllEventsByUserId(id);
					indexViewModel.MyEventCountTree = Repository.GetMyEventCountTree(id);
				}
				else
				{
					id = Repository.GetUserIdByName(userName);
					if (id > 0)
					{
						AppCache.Set(userName, id);

						indexViewModel.MyEvents = Repository.GetAllEventsByUserId(id);
						indexViewModel.MyEventCountTree = Repository.GetMyEventCountTree(id);
					}
				}
			}

			return View("Index", indexViewModel);
		}
	}
}
