﻿namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
	public interface IValidationResponse
	{
		bool IsSuccess { get; set; }
		string RequestContentLength { get; set; }
	}
}
