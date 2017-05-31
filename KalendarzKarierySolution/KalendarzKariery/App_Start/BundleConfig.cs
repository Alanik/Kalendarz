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

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
             "~/Scripts/Lib/jquery.validate*",
             "~/Scripts/Lib/jquery.unobtrusive*"));
            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/Lib/modernizr-*"));
            bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
            "~/Scripts/Lib/knockout-*"));

            //bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
            //"~/Scripts/Lib/jquery-{version}.js",
            //"~/Scripts/Lib/jquery.validate*",
            //"~/Scripts/Lib/jquery.unobtrusive*",
            //"~/Scripts/Lib/modernizr-*",
            //"~/Scripts/Lib/knockout-*",
            //"~/Scripts/Lib/SpinJS/spin.min.js",
            //"~/Scripts/Lib/Masonry/masonry-docs.min.js",
            //"~/Scripts/KnockoutCustomBindings/KOCustomBindings.js",
            //"~/Scripts/CalendarWidget/calendarWidget.js",
            //"~/Scripts/Lib/DzieuoJs/jquery.animate-enhanced.min.js",
            //"~/Scripts/Lib/DzieuoJs/jquery.easing.1.3.js",
            //"~/Scripts/Lib/DzieuoJs/dzieuo.js",
            //"~/Scripts/JSModels/KKEventModel.js",
            //"~/Scripts/JSModels/KKEventModelObservable.js",
            //"~/Scripts/JSModels/KKNoteModel.js",
            //"~/Scripts/JSModels/KKNoteModelObservable.js",
            //"~/Scripts/JSModels/KKDateModel.js",
            //"~/Scripts/JSModels/KKEventDateModel.js",
            //"~/Scripts/JSModels/KKEventDateModelObservable.js",
            //"~/Scripts/JSViewModels/AppViewModel.js",
            //"~/Scripts/JSUtils/EventColorHelper.js",
            //"~/Scripts/JSUtils/TreeBuilder.js",
            //"~/Scripts/JSUtils/WebApiCaller.js",
            //"~/Scripts/JSUtils/SimpleFilt.js",
            //"~/Scripts/JSManagers/EventManager.js",
            //"~/Scripts/JSManagers/NoteManager.js",
            //"~/Scripts/Program.js"
            //));

			bundles.Add( new StyleBundle( "~/Content/css" ).Include( "~/Content/Site.css", "~/Content/EventBlock.css", "~/Content/MediaQueries.css", "~/Content/MediaQueries_ShowHide.css", "~/Scripts/CalendarWidget/CalendarWidget.css", "~/Scripts/Lib/DzieuoJs/Dzieuo.css", "~/Content/Skin.css" ) );
        }
    }
}