
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
using KalendarzKarieryData.Models.AccountModels;
using System.Linq;

namespace KalendarzKariery.Controllers
{
	public class HomeController : BaseController
	{
		private readonly IKalendarzKarieryRepository _repository = RepositoryProvider.GetRepository();

		public ActionResult Index()
		{
			if (Request.IsAjaxRequest())
			{
				return View("Index", null);
			}

			MainViewModel mainViewModel = new MainViewModel();

			var indexViewModel = new IndexViewModel();
			indexViewModel.PublicEvents = _repository.GetAllPublicEvents();
			indexViewModel.EventKinds = _repository.GetEventKindsBasedOnUserName(User.Identity.Name);
			indexViewModel.PrivacyLevels = _repository.GetAllPrivacyLevels();
			indexViewModel.PublicEventCountTree = _repository.GetPublicEventCountTree();
			indexViewModel.News = _repository.GetAllNews();

			indexViewModel.MyEvents = null;
			indexViewModel.MyEventCountTree = null;
			RegisterViewModel registerViewModel = new RegisterViewModel();

			if (User.Identity.IsAuthenticated)
			{
				int? id = GetUserId(User.Identity.Name.ToLower(), _repository);

				if (id.HasValue)
				{
					indexViewModel.MyEvents = _repository.GetAllEventsByUserId(id.Value);
					indexViewModel.MyEventCountTree = _repository.GetMyEventCountTree(id.Value);
					registerViewModel = this.GetRegisterViewModel(id.Value, _repository);
				}
				else
				{
					//TODO: throw exception
				}
			}


			mainViewModel.IndexViewModel = indexViewModel;
			mainViewModel.RegisterViewModel = registerViewModel;

			return View("Index", mainViewModel);
		}

		private RegisterViewModel GetRegisterViewModel(int id, IKalendarzKarieryRepository repository)
		{
			RegisterViewModel registerViewModel = new RegisterViewModel();

			var user = repository.GetUserById(id);
			registerViewModel.User = user;

			if (user.Addresses.Any())
			{
				registerViewModel.Address = user.Addresses.First();
			}
			else
			{
				registerViewModel.Address = new Address();
			}

			registerViewModel.BirthDateModel = new DateModel();
			registerViewModel.BirthDateModel.Day = user.BirthDay.Day.ToString();
			registerViewModel.BirthDateModel.Month = user.BirthDay.Month.ToString();
			registerViewModel.BirthDateModel.Year = user.BirthDay.Year.ToString();
			registerViewModel.RegisterModel = new RegisterModel();
			registerViewModel.RegisterModel.UserName = user.UserName;

			return registerViewModel;
		}
	}
}
