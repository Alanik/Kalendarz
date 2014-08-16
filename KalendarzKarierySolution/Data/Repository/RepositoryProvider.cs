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
		//TODO: make assignable from web.config
			bool useFakeRepository = true;

			return new KalendarzKarieryData.Repository.KalendarzKarieryRepository.KalendarzKarieryRepository(useFakeRepository);
		}

	}
}
