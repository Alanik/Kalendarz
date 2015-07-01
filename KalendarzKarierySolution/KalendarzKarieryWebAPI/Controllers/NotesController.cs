using KalendarzKarieryCore.BO;
using KalendarzKarieryCore.Consts;
using KalendarzKarieryData;
using KalendarzKarieryData.BO.Cache;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryData.Repository;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace KalendarzKarieryWebAPI.Controllers
{
	public class NotesController : BaseController
	{
		private readonly IKalendarzKarieryRepository _repository = RepositoryProvider.GetRepository();

		// GET api/notes
		public IEnumerable<string> Get()
		{
			return new string[] { "value1", "value2" };
		}

		// GET api/notes/5
		public string Get( int id )
		{
			return "value";
		}

		// POST api/notes
		public IValidationResponse Post( AddNoteViewModel model )
		{
			if (!User.Identity.IsAuthenticated)
			{
				var response = new DefaultValidationResponseModel();
				response.Message = Consts.NotAuthenticatedErrorMsg;
				response.IsSuccess = false;
				return response;
			}

			if (string.IsNullOrWhiteSpace( model.Data ))
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = KalendarzKarieryCore.Consts.Consts.GeneralValidationErrorMsg;
				return response;
			}

			var note = this.GetNoteModelFromAddNoteViewModel( model );

			if (note == null)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}

			_repository.AddNote( note );
			_repository.Save();

			return new AddNoteValidationResponseModel { IsSuccess = true, NoteId = note.Id, DateAdded = note.DateAdded };

		}

		// PUT api/notes/5
		public IValidationResponse Put( UpdateNoteViewModel model )
		{
			if (!User.Identity.IsAuthenticated)
			{
				var response = new DefaultValidationResponseModel();
				response.Message = Consts.NotAuthenticatedErrorMsg;
				response.IsSuccess = false;
				return response;
			}

			if (string.IsNullOrWhiteSpace( model.Data ))
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = Consts.GeneralValidationErrorMsg;
				return response;
			}

			var note = _repository.GetNoteById( model.Id );

			if (note != null && note.User.UserName.ToLower() == this.User.Identity.Name.ToLower())
			{
				note.Data = model.Data;
				note.EditDate = DateTimeFacade.DateTimeNow();

				_repository.UpdateNote( note );
				_repository.Save();

				var response = new UpdateNoteValidationResponseModel();
				response.IsSuccess = true;
				response.NoteId = note.Id;
				return response;
			}
			else
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = Consts.GeneralValidationErrorMsg;
				return response;
			}
		}

		// DELETE api/notes/5
		public IValidationResponse Delete( int id )
		{
			if (!User.Identity.IsAuthenticated)
			{
				var response = new DefaultValidationResponseModel();
				response.IsSuccess = false;
				response.Message = Consts.NotAuthenticatedErrorMsg;
				return response;
			}

			var note = _repository.GetNoteById( id );

			if (note != null)
			{
				var response = new DefaultValidationResponseModel();

				if (note.User.UserName.ToLower() == User.Identity.Name.ToLower())
				{
					_repository.DeleteNote( note );
					_repository.Save();

					response.IsSuccess = true;
					response.Message = Consts.NoteDeletedSuccesfullyMsg;
					return response;
				}

				response.IsSuccess = false;
				response.Message = Consts.GeneralOperationErrorMsg;
				return response;
			}

			var r = new DefaultValidationResponseModel();
			r.IsSuccess = false;
			r.Message = Consts.NoteDoesNotExistErrorMsg;
			return r;
		}


		private Note GetNoteModelFromAddNoteViewModel( AddNoteViewModel viewModel )
		{
			var note = new Note();

			DateTime datetime = new DateTime( viewModel.DisplayDate.Year, viewModel.DisplayDate.Month, viewModel.DisplayDate.Day );

			note.Data = viewModel.Data;
			note.DateAdded = DateTimeFacade.DateTimeNow();
			note.DisplayDate = datetime;
			note.IsLineThrough = false;
			note.NoteKind = null;

			var objectId = AppCache.Get( User.Identity.Name.ToLower() );
			if (objectId != null)
			{
				note.OwnerUserId = (int)objectId;
			}
			else
			{
				int? id = _repository.GetUserIdByName( User.Identity.Name );

				if (id.HasValue)
				{
					note.OwnerUserId = id.Value;
				}
				else
				{
					return null;
				}
			}

			var privacyLevel = _repository.GetPrivacyLevelByValue( (int)KalendarzKarieryData.Enums.PrivacyLevel.@private );
			if (privacyLevel != null)
			{
				note.PrivacyLevel = privacyLevel;
			}
			else
			{
				return null;
			}

			return note;

		}
	}
}
