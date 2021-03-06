﻿using KalendarzKariery.BO.SeedMembership;
using System;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Helpers;
using System.Security.Claims;

namespace KalendarzKariery
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
			KalendarzKarieryWebAPI.App_Start.WebApiConfig.Register(GlobalConfiguration.Configuration);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
			AuthConfig.RegisterAuth();

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
					razorEngine.PartialViewLocationFormats.Union( newPartialViewFormats ).Reverse().ToArray();
			}

			AntiForgeryConfig.UniqueClaimTypeIdentifier = ClaimTypes.Email;

			//BundleTable.EnableOptimizations = true;
			InitializeMembership.SeedMembership();
        }

		protected void Application_Error( object sender, EventArgs e )
		{
			var error = Server.GetLastError();
			var code = (error is HttpException) ? (error as HttpException).GetHttpCode() : 500;

			if (code == 404)
			{
				// do something if page was not found. log for instance
			}
			else
			{
				// collect request info and log exception
			}

			Server.ClearError();
		}
    }
}
