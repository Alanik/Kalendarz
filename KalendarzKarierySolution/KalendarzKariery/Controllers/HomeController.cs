using KalendarzKarieryData;
using KalendarzKarieryData.Models.ViewModels;
using System.Web.Mvc;
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryData.Models.AccountModels;
using KalendarzKarieryData.Enums;

namespace KalendarzKariery.Controllers
{
	public class HomeController : BaseController
	{
		private readonly IKalendarzKarieryRepository _repository = RepositoryProvider.GetRepository();

		public ActionResult Index()
		{
			if (Request.IsAjaxRequest())
			{
				return View( "Index", null );
			}

			var currentUserId = this.GetUserId( User.Identity.Name.ToLower(), _repository );

			var indexViewModel = new IndexViewModel();
			indexViewModel.UpcomingPublicEvents = _repository.GetUpcomingEvents( 5, PrivacyLevelEnum.@public );
			indexViewModel.PublicEvents = _repository.GetAllPublicEvents( currentUserId );
			indexViewModel.EventKinds = _repository.GetEventKindsBasedOnUserName( User.Identity.Name );
			indexViewModel.PrivacyLevels = _repository.GetAllPrivacyLevels();
			indexViewModel.PublicEventCountTree = _repository.GetPublicEventCountTree();

			indexViewModel.MyEvents = null;
			indexViewModel.MyEventCountTree = null;

			if (User.Identity.IsAuthenticated)
			{
				indexViewModel.IsUserAuthenticated = true;
				indexViewModel.UserName = User.Identity.Name.ToLower();

				if (currentUserId.HasValue)
				{
					indexViewModel.MyEvents = _repository.GetAllEventsConnectedToUserId( currentUserId.Value );
					indexViewModel.MyEventCountTree = _repository.GetMyEventCountTree( currentUserId.Value );
					indexViewModel.MyNotes = _repository.GetNotesByUserId( currentUserId.Value );
				}
				else
				{
					//TODO: throw exception
				}
			}

			return View( "Index", indexViewModel );
		}

		public ActionResult m()
		{
			if (Request.IsAjaxRequest())
			{
				return View( "Index", null );
			}

			var currentUserId = this.GetUserId( User.Identity.Name.ToLower(), _repository );

			var indexViewModel = new IndexViewModel();
			indexViewModel.PublicEvents = _repository.GetAllPublicEvents( currentUserId );
			indexViewModel.EventKinds = _repository.GetEventKindsBasedOnUserName( User.Identity.Name );
			indexViewModel.PrivacyLevels = _repository.GetAllPrivacyLevels();
			indexViewModel.PublicEventCountTree = _repository.GetPublicEventCountTree();

			indexViewModel.MyEvents = null;
			indexViewModel.MyEventCountTree = null;

			if (User.Identity.IsAuthenticated)
			{
				if (currentUserId.HasValue)
				{
					indexViewModel.MyEvents = _repository.GetAllEventsCreatedByUserId( currentUserId.Value );
					indexViewModel.MyEventCountTree = _repository.GetMyEventCountTree( currentUserId.Value );
					indexViewModel.MyNotes = _repository.GetNotesByUserId( currentUserId.Value );
				}
				else
				{
					//TODO: throw exception
				}
			}

			return View( "Index", "~/Views/Shared/_LayoutMobile.cshtml", indexViewModel );
		}
	}
}
