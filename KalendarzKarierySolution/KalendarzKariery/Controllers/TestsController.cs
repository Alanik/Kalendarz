using System.Web.Mvc;

namespace KalendarzKariery.Controllers
{
    public class TestsController : Controller
    {
        //
        // GET: /Tests/

        public ActionResult JSUnitTests()
        {
            return View("JSUnitTests");
        }

    }
}
