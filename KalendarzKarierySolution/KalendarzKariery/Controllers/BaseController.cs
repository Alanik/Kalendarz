using KalendarzKarieryCore.Consts;
using KalendarzKarieryData.BO.Cache;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KalendarzKariery.Controllers
{
	public class BaseController : Controller
	{
		protected int? GetUserId(string username, IKalendarzKarieryRepository repository)
		{
			int? id;
			var objectId = AppCache.Get(Consts.UserIdCacheString + username);
			if (objectId != null)
			{
				id = (int?)objectId;
				return id;
			}
			else
			{
				id = repository.GetUserIdByName(username);

				if (id.HasValue)
				{
					AppCache.Set(Consts.UserIdCacheString + username, id.Value);
					return id.Value;
				}

				return null;
			}
		}

		protected void CacheUserId(string username, IKalendarzKarieryRepository repository)
		{
			var objectId = AppCache.Get(Consts.UserIdCacheString + username);

			if (objectId != null)
			{
				AppCache.Set(Consts.UserIdCacheString + username, (int)objectId);
				return;
			}

			int? id = repository.GetUserIdByName(username);

			if (id.HasValue)
			{
				AppCache.Set(Consts.UserIdCacheString + username, id.Value);
			}
		}
	}
}
