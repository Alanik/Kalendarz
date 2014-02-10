using System.Text.RegularExpressions;
using KalendarzKarieryData.Enums;
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
		public const string ValidationError = "Formularz zawiera nieprawidłowe dane";

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
			if (string.IsNullOrEmpty(viewModel.Event.Title))
			{
				SetResponseToInvalidState(response, ValidationError);
				return response;
			}

			if (viewModel.Event.Kind > Enum.GetNames(typeof(EventKindEnum)).Length)
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

			if (!string.IsNullOrEmpty(viewModel.Address.ZipCode))
			{
				var reg = new Regex("[0-9]{2}-[0-9]{3}");

				if (!reg.IsMatch(viewModel.Address.ZipCode))
				{
					SetResponseToInvalidState(response, ValidationError);
					return response;
				}
			}

			return null;
		}

		public void SetResponseToInvalidState(IResponse response, string message)
		{
			response.IsSuccess = false;
			response.Message = message;
		}
	}
}
