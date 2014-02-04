using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using KalendarzKarieryData;
using KalendarzKarieryData.Models.ViewModels;
using KalendarzKarieryWebAPI.Models.ResponseModels;
using Newtonsoft.Json;

namespace KalendarzKarieryWebAPI.Controllers
{
	public class EventsController : BaseController
	{
		private static readonly IKalendarzKarieryRepository Repository = new KalendarzKarieryRepository();

		// GET api/events
		public DefaultResponseModel Get()
		{

			string alan;

			if (User.Identity.IsAuthenticated && User.IsInRole("Administrator"))
			{
				alan = "alan";
			}
			else
			{
				alan = "false";
			}

			var defaultResponse = new DefaultResponseModel() { IsSuccess = true };
			return defaultResponse;
		}

		// GET api/events/5
		public string Get(int id)
		{
			return "value";
		}

		// POST api/events (add)
		public IResponse Post(AddEventViewModel addEventViewModel)
		{
			var errorResponse = ValidateUser(new DefaultResponseModel());
			if (errorResponse != null)
			{
				return errorResponse;
			}

			errorResponse = ValidateAddEventViewModel(errorResponse, addEventViewModel);

			if (ModelState.IsValid)
			{
				var model = addEventViewModel;
			}

			var defaultResponse = new DefaultResponseModel { IsSuccess = true };

			return defaultResponse;
		}

		// PUT api/events/5 (update)
		public void Put(int id, [FromBody] string value)
		{
		}

		// DELETE api/events/5
		public void Delete(int id)
		{
		}
	}
}