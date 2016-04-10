using System.Web.Optimization;

namespace KalendarzKariery
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/Lib/jquery-{version}.js"));

			bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
						"~/Scripts/Lib/jquery-ui-{version}.custom.js"));

	        bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
		        "~/Scripts/Lib/jquery.validate*",
		        "~/Scripts/Lib/jquery.unobtrusive*"));
	 
            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/Lib/modernizr-*"));

			bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
			"~/Scripts/Lib/knockout-*"));

			bundles.Add( new StyleBundle( "~/Content/css" ).Include( "~/Content/Site.css", "~/Content/MediaQueries.css", "~/Scripts/CalendarWidget/CalendarWidget.css", "~/Scripts/Lib/DzieuoJs/Dzieuo.css" ) );

			bundles.Add(new ScriptBundle("~/bundles/kalendarzKarieryScripts").Include(
			"~/Scripts/Lib/SpinJS/spin.min.js",
			"~/Scripts/KnockoutCustomBindings/KOCustomBindings.js",
			"~/Scripts/CalendarWidget/calendarWidget.js",
			"~/Scripts/CalendarWidget/Slider/jquery.animate-enhanced.min.js",
			"~/Scripts/CalendarWidget/Slider/jquery.easing.1.3.js",
			"~/Scripts/CalendarWidget/Slider/jquery.superslides.min.js",
			"~/Scripts/JSModels/KKEventModel.js",
			"~/Scripts/JSModels/KKEventModelObservable.js",
			"~/Scripts/JSModels/KKDateModel.js",
			"~/Scripts/JSModels/KKEventDateModel.js",
			"~/Scripts/JSViewModels/AppViewModel.js",
			"~/Scripts/Helpers/EventColorHelper.js",
			"~/Scripts/Helpers/TreeBuilder.js",
			"~/Scripts/Program.js"));
        }
    }
}