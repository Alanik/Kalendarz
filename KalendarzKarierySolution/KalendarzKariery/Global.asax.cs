using KalendarzKariery.BO.SeedMembership;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using KalendarzKarieryData.Repository.KalendarzKarieryRepository;
using KalendarzKarieryData.Repository;

namespace KalendarzKariery
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			KalendarzKarieryWebAPI.App_Start.WebApiConfig.Register(GlobalConfiguration.Configuration);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
			AuthConfig.RegisterAuth();
			InitializeMembership.SeedMembership();
			Effort.Provider.EffortProviderConfiguration.RegisterProvider();

			RazorViewEngine razorEngine = ViewEngines.Engines.OfType<RazorViewEngine>().FirstOrDefault();
			if (razorEngine != null)
			{
				var newPartialViewFormats = new[] { 
					"~/Views/Home/LobbyPage/{0}.cshtml",
					 "~/Views/Home/CalendarPage/{0}.cshtml",
					 "~/Views/Home/DetailsPage/{0}.cshtml",
					  "~/Views/Home/SharedPartials/{0}.cshtml"
			};
				razorEngine.PartialViewLocationFormats =
					razorEngine.PartialViewLocationFormats.Union(newPartialViewFormats).Reverse().ToArray();
			}

			//////////////////
			//var UserAccountInfo = new UserAccountInfo();
			//UserAccountInfo.CreationDate = DateTime.Now;
			//UserAccountInfo.NumOfLogins = 1;
			//UserAccountInfo.UserAccountInfoId = 1;

			//repo.AddUserAccountInfo(UserAccountInfo);
			//repo.Save();

			//var list = repo.GetUserAccountInfos();
			//////////////////
				
        }
    }
}
