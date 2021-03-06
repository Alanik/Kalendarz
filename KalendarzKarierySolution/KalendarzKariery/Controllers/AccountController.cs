﻿using System;
using System.Collections.Generic;
using System.Transactions;
using System.Web.Mvc;
using System.Web.Security;
using DotNetOpenAuth.AspNet;
using Microsoft.Web.WebPages.OAuth;
using WebMatrix.WebData;
using KalendarzKarieryData;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryData.Models.AccountModels;
using KalendarzKariery.BO.ExtentionMethods;
using System.Linq;
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryCore.Consts;
using KalendarzKarieryCore.BO;

namespace KalendarzKariery.Controllers
{
    [Authorize]
	public class
	AccountController : BaseController
	{
		private readonly IKalendarzKarieryRepository _repository = RepositoryProvider.GetRepository();

		[AllowAnonymous]
		public ActionResult Login()
		{
			return RedirectToAction( "Index", "Home" );
		}

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public ActionResult Login( LoginModel model )
		{
			if (ModelState.IsValid && WebSecurity.Login( model.UserName, model.Password, persistCookie: model.RememberMe ))
			{
				int? id = this.GetUserId( model.UserName.ToLower(), _repository );
				if (id.HasValue)
				{
					var user = _repository.GetUserById( id.Value );
					if (user != null && user.UserAccountInfo != null)
					{
						var accountInfo = user.UserAccountInfo;
						accountInfo.LastLogin = DateTimeFacade.DateTimeNow();
						accountInfo.NumOfLogins++;
						_repository.UpdateUserAccountInfo( accountInfo );
					}
					else
					{
						//TODO: throw exception
					}
				}
				else
				{
					//TODO: throw exception
				}

				return Json( new { userName = model.UserName } );
			}

			ModelState.AddModelError( string.Empty, Consts.InvalidUserNameOrPasswordErrorMsg );
			return Json( new { validationError = true } );
		}

		//
		// POST: /Account/LogOff

		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult LogOff()
		{
			int? id = this.GetUserId( User.Identity.Name.ToLower(), _repository );
			if (id.HasValue)
			{
				var user = _repository.GetUserById( id.Value );
				if (user != null && user.UserAccountInfo != null)
				{
					var accountInfo = user.UserAccountInfo;
					accountInfo.LastLogout = DateTimeFacade.DateTimeNow();
					_repository.UpdateUserAccountInfo( accountInfo );
				}
				else
				{
					//TODO: throw exception
				}
			}
			else
			{
				//TODO: throw exception
			}

			WebSecurity.Logout();
			return RedirectToAction( "Index", "Home" );
		}

		//
		// POST: /Account/Register

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public ActionResult Register( RegisterViewModel model )
		{
			if (_repository.GetUserByEmail( model.User.Email ) != null)
			{
				ModelState.AddModelError( "User.Email", Consts.RegisterUserEmailExistsErrorMsg );
				return Json( new { isRegisterSuccess = false, errors = ModelState.Errors() } );
			}

			if (!ModelState.IsValid)
			{
				return Json( new { isRegisterSuccess = false, errors = ModelState.Errors() } );
			}

			string birthDate = model.BirthDateModel.Year + "-" + model.BirthDateModel.Month + "-" + model.BirthDateModel.Day;
			DateTime date;

			if (!DateTime.TryParse( birthDate, out date ))
			{
				ModelState.AddModelError( string.Empty, Consts.InvalidBirthOfDateErrorMsg );
				ModelState.AddModelError( "BirthDateModel.Day", string.Empty );
				ModelState.AddModelError( "BirthDateModel.Month", string.Empty );
				ModelState.AddModelError( "BirthDateModel.Year", string.Empty );

				return Json( new { isRegisterSuccess = false, errors = ModelState.Errors() } );
			}

			try
			{
				WebSecurity.CreateUserAndAccount( model.RegisterModel.UserName,
												 model.RegisterModel.Password,
												 propertyValues: new
				{
					Email = model.User.Email,
					FirstName = model.User.FirstName,
					LastName = model.User.LastName,
					Bio = model.User.Bio,
					BirthDay = date,
					UserName = model.User.UserName,
					Phone = model.User.Phone,
					Gender = model.User.Gender,
				} );

				if (!Roles.GetRolesForUser( model.RegisterModel.UserName ).Contains( "BasicUser" ))
				{
					Roles.AddUserToRole( model.RegisterModel.UserName, "BasicUser" );
				}

				int id = WebSecurity.GetUserId( model.RegisterModel.UserName );
				var user = _repository.GetUserById( id );

				if (user != null)
				{

					Address address = null;

					if (!string.IsNullOrWhiteSpace( model.User.Address.Street ) || !string.IsNullOrWhiteSpace( model.User.Address.City ) || !string.IsNullOrWhiteSpace( model.User.Address.ZipCode) || !string.IsNullOrWhiteSpace(model.User.Address.Country))
					{
						address = model.User.Address;
					}

					_repository.UpdateUserAfterRegistration( user, address );
				}
				else
				{
					throw new NullReferenceException( "User from repository is null right after WebSecurity.CreateUserAndAccount call" );
				}

				WebSecurity.Login( model.RegisterModel.UserName, model.RegisterModel.Password );

				return Json( new { isRegisterSuccess = true } );
			}
			catch (MembershipCreateUserException e)
			{
				if (e.StatusCode == MembershipCreateStatus.DuplicateUserName)
				{
					ModelState.AddModelError( "RegisterModel.UserName", ErrorCodeToString( e.StatusCode ) );
				}
				else
				{
					ModelState.AddModelError( string.Empty, ErrorCodeToString( e.StatusCode ) );
				}

				return Json( new { isRegisterSuccess = false, errors = ModelState.Errors() } );
			}
		}

		//
		// POST: /Account/Disassociate

		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult Disassociate( string provider, string providerUserId )
		{
			string ownerAccount = OAuthWebSecurity.GetUserName( provider, providerUserId );
			ManageMessageId? message = null;

			// Only disassociate the account if the currently logged in user is the owner
			if (ownerAccount == User.Identity.Name)
			{
				// Use a transaction to prevent the user from deleting their last login credential
				using (var scope = new TransactionScope( TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.Serializable } ))
				{
					bool hasLocalAccount = OAuthWebSecurity.HasLocalAccount( WebSecurity.GetUserId( User.Identity.Name ) );
					if (hasLocalAccount || OAuthWebSecurity.GetAccountsFromUserName( User.Identity.Name ).Count > 1)
					{
						OAuthWebSecurity.DeleteAccount( provider, providerUserId );
						scope.Complete();
						message = ManageMessageId.RemoveLoginSuccess;
					}
				}
			}

			return RedirectToAction( "Manage", new { Message = message } );
		}

		//
		// GET: /Account/Manage

		public ActionResult Manage( ManageMessageId? message )
		{
			ViewBag.StatusMessage =
				message == ManageMessageId.ChangePasswordSuccess ? "Your password has been changed."
				: message == ManageMessageId.SetPasswordSuccess ? "Your password has been set."
				: message == ManageMessageId.RemoveLoginSuccess ? "The external login was removed."
				: "";
			ViewBag.HasLocalPassword = OAuthWebSecurity.HasLocalAccount( WebSecurity.GetUserId( User.Identity.Name ) );
			ViewBag.ReturnUrl = Url.Action( "Manage" );
			return View();
		}

		//
		// POST: /Account/Manage

		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult Manage( LocalPasswordModel model )
		{
			bool hasLocalAccount = OAuthWebSecurity.HasLocalAccount( WebSecurity.GetUserId( User.Identity.Name ) );
			ViewBag.HasLocalPassword = hasLocalAccount;
			ViewBag.ReturnUrl = Url.Action( "Manage" );
			if (hasLocalAccount)
			{
				if (ModelState.IsValid)
				{
					// ChangePassword will throw an exception rather than return false in certain failure scenarios.
					bool changePasswordSucceeded;
					try
					{
						changePasswordSucceeded = WebSecurity.ChangePassword( User.Identity.Name, model.OldPassword, model.NewPassword );
					}
					catch (Exception)
					{
						changePasswordSucceeded = false;
					}

					if (changePasswordSucceeded)
					{
						return RedirectToAction( "Manage", new { Message = ManageMessageId.ChangePasswordSuccess } );
					}
					else
					{
						ModelState.AddModelError( "", "The current password is incorrect or the new password is invalid." );
					}
				}
			}
			else
			{
				// User does not have a local password so remove any validation errors caused by a missing
				// OldPassword field
				ModelState state = ModelState["OldPassword"];
				if (state != null)
				{
					state.Errors.Clear();
				}

				if (ModelState.IsValid)
				{
					try
					{
						WebSecurity.CreateAccount( User.Identity.Name, model.NewPassword );
						return RedirectToAction( "Manage", new { Message = ManageMessageId.SetPasswordSuccess } );
					}
					catch (Exception)
					{
						ModelState.AddModelError( "", String.Format( "Unable to create local account. An account with the name \"{0}\" may already exist.", User.Identity.Name ) );
					}
				}
			}

			// If we got this far, something failed, redisplay form
			return View( model );
		}

		//
		// POST: /Account/ExternalLogin

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public ActionResult ExternalLogin( string provider, string returnUrl )
		{
			return new ExternalLoginResult( provider, Url.Action( "ExternalLoginCallback", new { ReturnUrl = returnUrl } ) );
		}

		//
		// GET: /Account/ExternalLoginCallback

		[AllowAnonymous]
		public ActionResult ExternalLoginCallback( string returnUrl )
		{
			AuthenticationResult result = OAuthWebSecurity.VerifyAuthentication( Url.Action( "ExternalLoginCallback", new { ReturnUrl = returnUrl } ) );
			if (!result.IsSuccessful)
			{
				return RedirectToAction( "ExternalLoginFailure" );
			}

			if (OAuthWebSecurity.Login( result.Provider, result.ProviderUserId, createPersistentCookie: false ))
			{
				return RedirectToLocal( returnUrl );
			}

			if (User.Identity.IsAuthenticated)
			{
				// If the current user is logged in add the new account
				OAuthWebSecurity.CreateOrUpdateAccount( result.Provider, result.ProviderUserId, User.Identity.Name );
				return RedirectToLocal( returnUrl );
			}
			else
			{
				// User is new, ask for their desired membership name
				string loginData = OAuthWebSecurity.SerializeProviderUserId( result.Provider, result.ProviderUserId );
				ViewBag.ProviderDisplayName = OAuthWebSecurity.GetOAuthClientData( result.Provider ).DisplayName;
				ViewBag.ReturnUrl = returnUrl;
				return View( "ExternalLoginConfirmation", new RegisterExternalLoginModel { UserName = result.UserName, ExternalLoginData = loginData } );
			}
		}


		//POST: /Account/ExternalLoginConfirmation

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public ActionResult ExternalLoginConfirmation( RegisterExternalLoginModel model, string returnUrl )
		{
			string provider = null;
			string providerUserId = null;

			if (User.Identity.IsAuthenticated || !OAuthWebSecurity.TryDeserializeProviderUserId( model.ExternalLoginData, out provider, out providerUserId ))
			{
				return RedirectToAction( "Manage" );
			}

			if (ModelState.IsValid)
			{
				// Insert a new user into the database
				using (UsersContext db = new UsersContext())
				{
					UserProfile user = db.UserProfiles.FirstOrDefault( u => u.UserName.ToLower() == model.UserName.ToLower() );
					// Check if user already exists
					if (user == null)
					{
						// Insert name into the profile table
						db.UserProfiles.Add( new UserProfile { UserName = model.UserName } );
						db.SaveChanges();

						OAuthWebSecurity.CreateOrUpdateAccount( provider, providerUserId, model.UserName );
						OAuthWebSecurity.Login( provider, providerUserId, createPersistentCookie: false );

						return RedirectToLocal( returnUrl );
					}
					else
					{
						ModelState.AddModelError( "UserName", "User name already exists. Please enter a different user name." );
					}
				}
			}

			ViewBag.ProviderDisplayName = OAuthWebSecurity.GetOAuthClientData( provider ).DisplayName;
			ViewBag.ReturnUrl = returnUrl;
			return View( model );
		}

		//
		// GET: /Account/ExternalLoginFailure

		[AllowAnonymous]
		public ActionResult ExternalLoginFailure()
		{
			return View();
		}

		[AllowAnonymous]
		[ChildActionOnly]
		public ActionResult ExternalLoginsList( string returnUrl )
		{
			ViewBag.ReturnUrl = returnUrl;
			return PartialView( "_ExternalLoginsListPartial", OAuthWebSecurity.RegisteredClientData );
		}

		[ChildActionOnly]
		public ActionResult RemoveExternalLogins()
		{
			ICollection<OAuthAccount> accounts = OAuthWebSecurity.GetAccountsFromUserName( User.Identity.Name );
			List<ExternalLogin> externalLogins = new List<ExternalLogin>();
			foreach (OAuthAccount account in accounts)
			{
				AuthenticationClientData clientData = OAuthWebSecurity.GetOAuthClientData( account.Provider );

				externalLogins.Add( new ExternalLogin
				{
					Provider = account.Provider,
					ProviderDisplayName = clientData.DisplayName,
					ProviderUserId = account.ProviderUserId,
				} );
			}

			ViewBag.ShowRemoveButton = externalLogins.Count > 1 || OAuthWebSecurity.HasLocalAccount( WebSecurity.GetUserId( User.Identity.Name ) );
			return PartialView( "_RemoveExternalLoginsPartial", externalLogins );
		}

		#region Helpers

		private ActionResult RedirectToLocal( string returnUrl )
		{
			if (Url.IsLocalUrl( returnUrl ))
			{
				return Redirect( returnUrl );
			}
			else
			{
				return RedirectToAction( "Index", "Home" );
			}
		}

		public enum ManageMessageId
		{
			ChangePasswordSuccess,
			SetPasswordSuccess,
			RemoveLoginSuccess,
		}

		internal class ExternalLoginResult : ActionResult
		{
			public ExternalLoginResult( string provider, string returnUrl )
			{
				Provider = provider;
				ReturnUrl = returnUrl;
			}

			public string Provider { get; private set; }
			public string ReturnUrl { get; private set; }


			public override void ExecuteResult( ControllerContext context )
			{
				OAuthWebSecurity.RequestAuthentication( Provider, ReturnUrl );
			}
		}

		private static string ErrorCodeToString( MembershipCreateStatus createStatus )
		{
			// See http://go.microsoft.com/fwlink/?LinkID=177550 for
			// a full list of status codes.
			switch (createStatus)
			{
				case MembershipCreateStatus.DuplicateUserName:
					return "Podana nazwa użytkownika już istnieje. Prosze wybrać inna nazwe użytkownika.";

				case MembershipCreateStatus.DuplicateEmail:
					return "Podany adres email już został użyty. Prosze podać inny adres email.";

				case MembershipCreateStatus.InvalidPassword:
					return "The password provided is invalid. Please enter a valid password value.";

				case MembershipCreateStatus.InvalidEmail:
					return "The e-mail address provided is invalid. Please check the value and try again.";

				case MembershipCreateStatus.InvalidAnswer:
					return "The password retrieval answer provided is invalid. Please check the value and try again.";

				case MembershipCreateStatus.InvalidQuestion:
					return "The password retrieval question provided is invalid. Please check the value and try again.";

				case MembershipCreateStatus.InvalidUserName:
					return "The user name provided is invalid. Please check the value and try again.";

				case MembershipCreateStatus.ProviderError:
					return "The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

				case MembershipCreateStatus.UserRejected:
					return "The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

				default:
					return "An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.";
			}
		}

		#endregion
	}
}
