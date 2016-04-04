using KalendarzKarieryData.Repository.KalendarzKarieryRepository;

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
