using KalendarzKarieryData;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


namespace KalendarzKarieryWebAPI.Controllers
{
	public class AccountController : BaseController
	{
		private readonly IKalendarzKarieryRepository _repository = RepositoryProvider.GetRepository();

		// POST api/events (add)
		public IValidationResponse Post(RegisterViewModel model)
		{
			var errorResponse = this.ValidateUser();
			if (!errorResponse.IsSuccess)
			{
				return errorResponse;
			}

			if (!ModelState.IsValid)
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = KalendarzKarieryCore.Consts.Consts.GeneralValidationErrorMsg;
				return response;
			}

			var user = _repository.GetUserById(model.User.Id);

			if (user != null && User.Identity.Name.ToLower() == user.UserName.ToLower())
			{
				string birthDate = model.BirthDateModel.Year + "-" + model.BirthDateModel.Month + "-" + model.BirthDateModel.Day;
				DateTime date;

				if (DateTime.TryParse(birthDate, out date))
				{
					user.Bio = model.User.Bio;
					user.BirthDay = date;
					user.Email = model.User.Email;
					user.FirstName = model.User.FirstName;
					user.LastName = model.User.LastName;
					user.Phone = model.User.Phone;
					user.WebSiteUrl = model.User.WebSiteUrl;
					user.Gender = model.User.Gender;

					user.Addresses.Clear();
					user.Addresses.Add(model.Address);

					_repository.Save();

					var response = new DefaultValidationResponseModel();
					response.IsSuccess = true;
					return response;
				}
				else
				{
					var response = new DefaultValidationResponseModel();
					response.IsSuccess = false;
					response.Message = KalendarzKarieryCore.Consts.Consts.GeneralValidationErrorMsg;
					return response;
				}
			}
			else
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = KalendarzKarieryCore.Consts.Consts.GeneralValidationErrorMsg;
				return response;
			}
		}
	}
}
