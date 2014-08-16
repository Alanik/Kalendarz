using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
	public class DefaultResponse : IResponse
	{
		public bool IsSuccess { get; set; }
		public string Message { get; set; }

	}
}