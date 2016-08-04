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
		[HttpGet]
		public string GetNote( int id )
		{
			return "value";
		}

		// POST api/notes
		[HttpPost]
		public IValidationResponse AddNote( AddNoteViewModel model )
		{
			if (!User.Identity.IsAuthenticated)
			{
				return new DefaultValidationResponseModel(){ Message = Consts.NotAuthenticatedErrorMsg, IsSuccess = false };
			}

			if (string.IsNullOrWhiteSpace( model.Data ))
			{
				return new DefaultValidationResponseModel(){ Message = Consts.GeneralValidationErrorMsg, IsSuccess = false };
			}

			var note = this.GetNoteModelFromAddNoteViewModel( model );

			if (note == null)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}

			_repository.AddNote( note );

			return new AddNoteValidationResponseModel { IsSuccess = true, NoteId = note.Id};
		}

		// PUT api/notes/5
		[HttpPut]
		public IValidationResponse UpdateNote( UpdateNoteViewModel model )
		{
			if (!User.Identity.IsAuthenticated)
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.NotAuthenticatedErrorMsg };
			}

			if (string.IsNullOrWhiteSpace( model.Data ))
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralValidationErrorMsg };
			}

			var note = _repository.GetNoteById( model.Id );

			if ( note != null )
			{
				if (note.User.UserName.Equals( User.Identity.Name, StringComparison.InvariantCultureIgnoreCase ))
				{
					note.Data = model.Data;
					note.IsLineThrough = model.IsLineThrough;
					note.EditDate = DateTimeFacade.DateTimeNow();

					_repository.UpdateNote( note );

					return new DefaultValidationResponseModel { IsSuccess = true };	
				}

				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}
			else
			{
				return new DefaultValidationResponseModel { IsSuccess = false, Message = Consts.NoteDoesNotExistErrorMsg };
			}
		}

		// DELETE api/notes/5
		[HttpDelete]
		public IValidationResponse DeleteNote( int id )
		{
			if (!User.Identity.IsAuthenticated)
			{
				return new DefaultValidationResponseModel(){IsSuccess = false, Message = Consts.NotAuthenticatedErrorMsg};
			}

			var note = _repository.GetNoteById( id );

			if (note != null)
			{
				if (note.User.UserName.Equals(User.Identity.Name, StringComparison.InvariantCultureIgnoreCase))
				{
					_repository.DeleteNote( note );
					return  new DefaultValidationResponseModel(){ IsSuccess = true, Message = Consts.NoteDeletedSuccesfullyMsg };
				}

				return new DefaultValidationResponseModel() { IsSuccess = false, Message = Consts.GeneralOperationErrorMsg };
			}

			return new DefaultValidationResponseModel(){IsSuccess = false, Message = Consts.NoteDoesNotExistErrorMsg};
		}

		private Note GetNoteModelFromAddNoteViewModel( AddNoteViewModel viewModel )
		{
			var note = new Note();

			DateTime datetime = new DateTime( viewModel.DisplayDate.Year, viewModel.DisplayDate.Month, viewModel.DisplayDate.Day );

			note.Data = viewModel.Data;
			note.CreateDate = DateTimeFacade.DateTimeNow();
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

			var privacyLevel = _repository.GetPrivacyLevelByValue( (int)KalendarzKarieryData.Enums.PrivacyLevelEnum.@private );
			if (privacyLevel != null)
			{
				note.PrivacyLevelId = privacyLevel.Id;
			}
			else
			{
				return null;
			}

			return note;
		}
	}
}
