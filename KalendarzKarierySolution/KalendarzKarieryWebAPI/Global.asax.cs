﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;
using KalendarzKarieryWebAPI.App_Start;

namespace KalendarzKarieryWebAPI
{
	// Note: For instructions on enabling IIS6 or IIS7 classic mode, 
	// visit http://go.microsoft.com/?LinkId=9394801

	public class WebApiApplication : System.Web.HttpApplication
	{
		protected void Application_Start()
		{
			//moved to KalendarzKariery Global.asax AplicationStart()
			//WebApiConfig.Register(GlobalConfiguration.Configuration);
		}
	}
}