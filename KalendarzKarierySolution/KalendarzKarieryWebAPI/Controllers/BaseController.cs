using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace KalendarzKarieryWebAPI.Controllers
{
	public class BaseController : ApiController
	{

		protected IResponse ValidateUser(IResponse response)
		{

			const string NotAuthenticatedMsg = "Musisz być zalogowany by wykonać tę operację";
			const string NotAuthorizedMsg = "Nie masz uprawnień by wykonać tę operację";

			if (!User.Identity.IsAuthenticated)
			{
				response.Message = NotAuthenticatedMsg;
				return response;
			}

			if (!User.IsInRole("Administrator"))
			{
				response.Message = NotAuthorizedMsg;
				return response;
			}

			return null;
		}

		protected IResponse ValidateAddEventViewModel(IResponse response, AddEventViewModel viewModel)
		{
			const string ValidationError = "Formularz zawiera nieprawidłowe dane";

			if (string.IsNullOrEmpty(viewModel.Event.Title))
			{
				SetResponseToInvalidState(response, ValidationError);
				return response;
			}

			if (viewModel.Event.Kind > 5)
			{
				SetResponseToInvalidState(response, ValidationError);
				return response;
			}

			var startDate = new DateTime();

			if (!DateTime.TryParse(viewModel.Event.StartDate.ToString(), out startDate))
			{
				SetResponseToInvalidState(response, ValidationError);
				return response;
			}

			return null;
		}

		private void SetResponseToInvalidState(IResponse response, string message)
		{
			response.IsSuccess = false;
			response.Message = message;
		}
	}
}
