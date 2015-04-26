using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryWebAPI.Models.ResponseModels
{
	public interface IValidationResponse
	{
		 bool IsSuccess { get; set; }
	}
}
