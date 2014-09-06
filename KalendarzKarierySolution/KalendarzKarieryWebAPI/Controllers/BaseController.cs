using System.Text.RegularExpressions;
using KalendarzKarieryData.Enums;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using KalendarzKarieryCore.Consts;

namespace KalendarzKarieryWebAPI.Controllers
{
	public class BaseController : ApiController
	{
		protected IResponse ValidateUser()
		{
			var response = new DefaultResponseModel();
			response.IsSuccess = true;

			if (!User.Identity.IsAuthenticated)
			{
				response.Message = Consts.NotAuthenticatedErrorMsg;
				response.IsSuccess = false;
				return response;
			}

			//if (!User.IsInRole(Consts.AdminRole))
			//{
			//	response.Message = Consts.NotAuthorizedErrorMsg;
			//	response.IsSuccess = false;
			//	return response;
			//}

			return response;
		}

		protected IResponse ValidateAddEventViewModel(AddEventViewModel viewModel)
		{
			var response = new DefaultResponseModel();
			response.IsSuccess = true;

			if (string.IsNullOrEmpty(viewModel.Event.Title))
			{
				response.IsSuccess = false;
				response.Message = Consts.GeneralValidationErrorMsg;
				return response;
			}

			var startDate = new DateTime();
			if (!DateTime.TryParse(viewModel.Event.StartDate.ToString(), out startDate))
			{
				response.IsSuccess = false;
				response.Message = Consts.GeneralValidationErrorMsg;
				return response;
			}

			if (!string.IsNullOrEmpty(viewModel.Address.ZipCode))
			{
				var reg = new Regex("[0-9]{2}-[0-9]{3}");

				if (!reg.IsMatch(viewModel.Address.ZipCode))
				{
					response.IsSuccess = false;
					response.Message = Consts.GeneralValidationErrorMsg;
					return response;
				}
			}

			return response;
		}
	}
}
