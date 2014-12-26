using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Text;
using System.Threading.Tasks;

namespace KalendarzKarieryData.BO.Cache
{
	public static class AppCache
	{
		//TODO: should use lock?
		private static readonly Object _locker = new object();
		private static ObjectCache Cache { get { return MemoryCache.Default; } }
		const int CacheTime = 720; // 12 hours

		public static object Get(string key)
		{
			return Cache[key];
		}

		public static void Set(string key, object data, int cacheTime = CacheTime)
		{
			CacheItemPolicy policy = new CacheItemPolicy();
			policy.AbsoluteExpiration = DateTime.Now + TimeSpan.FromMinutes(cacheTime);

			Cache.Set(new CacheItem(key, data), policy);
		}

		public static void Remove(string key)
		{
			Cache.Remove(key);
		}
	}
}
