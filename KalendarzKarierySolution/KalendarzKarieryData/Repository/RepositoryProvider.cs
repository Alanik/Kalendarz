
using KalendarzKarieryData.BO.Cache;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.Repository
{
	public static class RepositoryProvider
	{
		public static IKalendarzKarieryRepository GetRepository()
		{
			return new KalendarzKarieryData.Repository.KalendarzKarieryRepository.KalendarzKarieryRepository();
		}
	}
}
