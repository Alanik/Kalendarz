using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData
{
	public interface IKalendarzKarieryRepository
	{
		User GetUserById(int id);
		User GetUserByEmail(string email);
		void UpdateUserOnRegister(int id, Address address);
	}
}
