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
		protected IValidationResponse ValidateUser()
		{
			var response = new DefaultValidationResponseModel();
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
	}
}
