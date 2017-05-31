using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
	public class BaseResponseModel : IValidationResponse
	{
		public bool IsSuccess { get; set; }
		public string RequestContentLength { get; set; }
	}
}