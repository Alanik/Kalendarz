using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData
{
	public interface IRepository
	{
		User GetUserById(int id);
		User GetUserByEmail(int id);
		void UpdateUserOnRegister(int id, Address address);
		void Save();
	}
}
