using KalendarzKarieryCore.Consts;
using KalendarzKarieryData;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using System;


namespace KalendarzKarieryWebAPI.Controllers
{
    public class AccountController : BaseController
	{
		private readonly IKalendarzKarieryRepository _repository = RepositoryProvider.GetRepository();

		public IValidationResponse Post( RegisterViewModel model )
		{
			if (!User.Identity.IsAuthenticated)
			{
				var response = new DefaultValidationResponseModel();
				response.Message = Consts.NotAuthenticatedErrorMsg;
				response.IsSuccess = false;
				return response;
			}

			if (!ModelState.IsValid)
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = KalendarzKarieryCore.Consts.Consts.GeneralValidationErrorMsg;
				return response;
			}

			var user = _repository.GetUserById( model.User.Id );

			if (user != null && User.Identity.Name.Equals(user.UserName, StringComparison.InvariantCultureIgnoreCase))
			{
				string birthDate = model.BirthDateModel.Year + "-" + model.BirthDateModel.Month + "-" + model.BirthDateModel.Day;
				DateTime date;

				if (DateTime.TryParse( birthDate, out date ))
				{
					user.Bio = model.User.Bio;
					user.BirthDay = date;
					user.Email = model.User.Email;
					user.FirstName = model.User.FirstName;
					user.LastName = model.User.LastName;
					user.Phone = model.User.Phone;
					user.WebSiteUrl = model.User.WebSiteUrl;
					user.Gender = model.User.Gender;

					Address address = null;

					if (!string.IsNullOrWhiteSpace( model.User.Address.Street ) || !string.IsNullOrWhiteSpace( model.User.Address.City ) || !string.IsNullOrWhiteSpace( model.User.Address.ZipCode) || !string.IsNullOrWhiteSpace(model.User.Address.Country))
					{
					    address = model.User.Address;
					}

					_repository.UpdateUser(user, address);

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
