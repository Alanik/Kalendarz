var Program = {
  indexViewModel: null,
  initializeJQueryExtentionMethods: function (simpleFilt) {
    jQuery.fn.extend({
      scrollTo: function (speed, offset) {
        if (!offset) {
          offset = this.position().top - 50;
        }
        this.closest(".dz-column").animate({ scrollTop: offset }, speed);
      }
    });

    jQuery.extend({
      simpleFilt: simpleFilt
    })
  },
  initializeAndStartSpinner: function () {
    //////////////////////////////////////////////////////////
    //ajax loader (spinner)
    //////////////////////////////////////////////////////////
    var opts = {
      lines: 17, // The number of lines to draw
      length: 6, // The length of each line
      width: 4, // The line thickness
      radius: 20, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#FFF', // #rgb or #rrggbb or array of colors
      speed: 2, // Rounds per second
      trail: 80, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };

    this.spinner = new Spinner(opts);

    //used in jquery.superslides to turn spinner off when superslides fades in.
    window.spinner = this.spinner;

    var $target = $("#spinnerContainer");

    //Get the window height and width
    var winH = $(window).height();
    var winW = $(window).width();

    //Set the popup window to center
    $target.css('top', winH / 2 - $target.height() / 2);
    $target.css('left', winW / 2 - $target.width() / 2 - 20);

    //this.spinner.spin($target[0]);
    //$target.show();
  },
  initializeEventGrid: function () {
    var $container = $('#lobby .grid');
    //layout Masonry again after all images have loaded
    $container.imagesLoaded(function () {
      $container.masonry({
        itemSelector: '.event-block-container'
      });
    });
  },
  initialize: function (indexViewModel, userName) {
    "use strict";

    var $calendar = $("#calendarWidget");
    var $details = $("#details");
    var $lobby = $("#lobby");

    var date = new Date();
    $calendar.calendarWidget({
      month: date.getMonth(), year: date.getFullYear()
    });
    var appViewModel = new AppViewModel(date, userName, this.spinner);

    appViewModel.eventPrivacyLevels = appViewModel.UTILS.eventTreeBuilder.transformPrivacyLevels(indexViewModel.PrivacyLevels);
    appViewModel.eventKinds = indexViewModel.EventKinds;
    appViewModel.publicEventTree = appViewModel.UTILS.eventTreeBuilder.buildEventTree(indexViewModel.PublicEvents, true);
    appViewModel.publicEventTreeCountBasedOnEventKind = appViewModel.UTILS.eventTreeBuilder.buildEventTreeCountBasedOnEventKind(indexViewModel.PublicEventCountTree, appViewModel.eventKinds);

    //appViewModel.newsEvents = appViewModel.UTILS.eventTreeBuilder.transformNews( indexViewModel.News );

    //if user is logged in
    if (indexViewModel.MyEvents) {
      appViewModel.myEventTree = appViewModel.UTILS.eventTreeBuilder.buildEventTree(indexViewModel.MyEvents, false);
      appViewModel.myEventTreeCountBasedOnEventKind = appViewModel.UTILS.eventTreeBuilder.buildEventTreeCountBasedOnEventKind(indexViewModel.MyEventCountTree, appViewModel.eventKinds);

      appViewModel.myNoteTree = appViewModel.UTILS.eventTreeBuilder.buildNoteTree(indexViewModel.MyNotes);

      //console.log( JSON.stringify(appViewModel.myEventTree));
      //console.log( appViewModel.myEventTree );
      //console.log( appViewModel.myNoteTree );

      //console.log( appViewModel.publicEvents);
      //console.log( appViewModel.publicEventTree);
      //console.log( appViewModel.publicEventTreeCountBasedOnEventKind );
      //console.log( appViewModel.myEventTreeCountBasedOnEventKind );
      //console.log( appViewModel.eventPrivacyLevels);

      /////////////////////////////////////////////////////////////////////////
      //draw events to the calendar
      /////////////////////////////////////////////////////////////////////////
      var yearProp = appViewModel.myEventTree[appViewModel.calendarPageDisplayDate.year()];
      var events, month, nextMonth, prevMonth, event, calendarPageMonth = appViewModel.calendarPageDisplayDate.month();

      // current month
      if (yearProp) {
        month = yearProp[calendarPageMonth]
        if (month) {
          for (var days in month) {
            events = month[days];
            for (var i = 0; i < events.length; i++) {
              event = events[i];

              appViewModel.drawEventToCalendar(event);
            }
          }
        }
      }
      // prev month
      if (appViewModel.calendarPageDisplayDate.month() == 1) {
        calendarPageMonth = 12;
        yearProp = appViewModel.myEventTree[appViewModel.calendarPageDisplayDate.year() - 1];
      }
      else {
        calendarPageMonth = calendarPageMonth - 1;
      }

      if (yearProp) {
        prevMonth = yearProp[calendarPageMonth];
        if (prevMonth) {
          for (var days in prevMonth) {
            events = prevMonth[days];
            for (var i = 0; i < events.length; i++) {
              event = events[i];

              appViewModel.drawEventToCalendar(event);
            }
          }
        }
      }

      // next month
      if (appViewModel.calendarPageDisplayDate.month() == 12) {
        calendarPageMonth = 1;
        yearProp = appViewModel.myEventTree[appViewModel.calendarPageDisplayDate.year() + 1];
      }
      else {
        calendarPageMonth = calendarPageMonth + 1;
      }

      nextMonth = yearProp[calendarPageMonth];
      if (nextMonth) {
        for (var days in nextMonth) {
          events = nextMonth[days];
          for (var i = 0; i < events.length; i++) {
            event = events[i];

            appViewModel.drawEventToCalendar(event);
          }
        }
      }
    }

    //////////////////////////////////////////////////////////////////
    //initialize details page
    //////////////////////////////////////////////////////////////////
    appViewModel.detailsPageEventMostBottomRow = 1;
    appViewModel.detailsPageDisplayDate.year(date.getFullYear());
    appViewModel.detailsPageDisplayDate.month(date.getMonth() + 1);
    appViewModel.detailsPageDisplayDate.day(date.getDate());

    var events = appViewModel.EVENT_MANAGER.getEventsForGivenDay(appViewModel.detailsPageDisplayDate.year(), appViewModel.detailsPageDisplayDate.month(), appViewModel.detailsPageDisplayDate.day(), appViewModel.myEventTree)
    var notes = appViewModel.NOTE_MANAGER.getNotesForGivenDay(appViewModel.detailsPageDisplayDate.year(), appViewModel.detailsPageDisplayDate.month(), appViewModel.detailsPageDisplayDate.day())
    appViewModel.detailsPageDayEvents(events);
    appViewModel.detailsPageDayNotes(notes);
    ///////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////
    //Knockout apply bindings
    ///////////////////////////////////////////////////////////////////
    ko.applyBindings(appViewModel);
    ///////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////
    //draw to details page
    ///////////////////////////////////////////////////////////////////

    //method drawEventToDetailsDayTable(events[i]) needs to be called after ko.applyBindings(appViewModel)!
    for (var i in events) {
      appViewModel.drawEventToDetailsDayTable(events[i]);
    }

    var $tableBody = $("#detailsDayTable .details-day-table-body");
    var h = (appViewModel.detailsPageEventMostBottomRow) * 46;
    h = h + 20;
    $tableBody.height(h + "px");
    ///////////////////////////////////////////////////////////////////

    //this.initializeSlides = function () {
    //    location.hash = '#0';

    //    var $slides = $('#slides');

    //    //for touch swipes (using hammer.js)
    //    //Hammer( $slides[0] ).on( "swipeleft", function ( e )
    //    //{
    //    //	$slides.data( 'superslides' ).animate( 'next' );
    //    //} );

    //    //Hammer( $slides[0] ).on( "swiperight", function ( e )
    //    //{
    //    //	$slides.data( 'superslides' ).animate( 'prev' );
    //    //} );

    //    $slides.superslides({
    //        slide_easing: 'easeInOutCubic',
    //        slide_speed: 800,
    //        pagination: true,
    //        hashchange: true,
    //        scrollable: true
    //    });

    //    $(window).on("hashchange", function () {
    //        setTimeout(function () {
    //            var events = appViewModel.calendarDayEventsToUpdate.events;

    //            if (location.hash === "#0") {
    //                appViewModel.currentPage() = 0;
    //            }
    //            else if (location.hash === "#1") {
    //                appViewModel.currentPage() = 1;

    //                if (events && $.isArray(events)) {
    //                    //setTimeout( function ()
    //                    //{
    //                    appViewModel.redrawCalendarCell(events, appViewModel.calendarDayEventsToUpdate.day, appViewModel.calendarDayEventsToUpdate.month, appViewModel.calendarDayEventsToUpdate.year);
    //                    appViewModel.calendarDayEventsToUpdate.events = null;
    //                    //}, 10 )
    //                }

    //                //TODO: not finished set dynamic height of calendar cells (calendar's height to be as browser window)
    //                //setTimeout(function(){				

    //                //	var height1 = $("#calendar #calendarMenuHeader").height();
    //                //	var height2 = $("#calendar .weekday-container").height();
    //                //	var height3 = $("#calendar .calendar-hours-placeholder").first().height();
    //                //	var height4 = 42;
    //                //	var winHeight = $(window).height();

    //                //	var cellHeight = (winHeight - (height1 + height2 + height3 + 60)) / 6;

    //                //	$("#calendar .calendar-cell").css("height", cellHeight);

    //                //	console.log(cellHeight);

    //                //}, 10)

    //            }
    //            else if (location.hash === "#2") {
    //                appViewModel.currentPage() = 2;
    //            }
    //        }, 10);
    //    });

    //    $(".slides-pagination a").on("click", function () {
    //        var hash = $(this).attr("href");

    //        if (hash === "#2") {
    //            var $scrollable = $("#slide-item-details").parent();

    //            setTimeout(function () {
    //                $scrollable.scrollTop(0);
    //            }, 10)
    //        }
    //    });
    //}();

    //this.createCalendarNavigationArrows = function () {
    //    $calendar.append('<div id="calendar-navigation-arrows-left"><img src="Images/Nav/arrowLeft.png" alt="arrow-left"/></div>');
    //    $calendar.append('<div id="calendar-navigation-arrows-right"><img src="Images/Nav/arrowRight.png" alt="arrow-Right"/></div>');
    //    $details.append('<div id="details-navigation-arrows-left"><img src="Images/Nav/arrowLeft.png" alt="arrow-Left"/></div>');
    //    $lobby.append('<div id="lobby-navigation-arrows-right"><img src="Images/Nav/arrowRight.png" alt="arrow-Right"/></div>');
    //}();

    //this.drawClocks = function () {
    //    appViewModel.drawAnalogClock();
    //    appViewModel.drawDigitalClock();
    //}();

    this.initializeHover = function () {
      var $eventHoverContainer = $("#eventHoverContainer");
      var $mainContainer = $("#mainContainer");
      var tap = ("ontouchstart" in document.documentElement);

      if (!tap) {
        $mainContainer.on({
          mouseenter: function () {
            $(this).css({
              "border-bottom": "2px solid rgb(235,235,235)",
              "border-top": "2px solid rgb(250,250,250)",
              "cursor": "pointer",
              "top": "3px"
            }).find(".addNewEvent-cellIcon").fadeIn();
          },
          mouseleave: function () {
            $(this).css({
              "border": "2px solid white",
              "cursor": "auto",
              "top": "0"
            }).find(".addNewEvent-cellIcon").hide();
          }
        }, '.current-month-cell');

        $mainContainer.on({
          mouseenter: function () {
            $(this).css({
              "cursor": "pointer",
              "top": "3px"
            }).find(".addNewEvent-cellIcon").fadeIn();
          },
          mouseleave: function () {
            $(this).css({
              "cursor": "auto",
              "top": "0px"
            }).find(".addNewEvent-cellIcon").fadeOut();
          }
        }, '.other-month-cell');

        $mainContainer.on({
          mouseenter: function () {
            var $this = $(this);
            var name = $this.data("name");
            var address = $this.data("address");
            var startHour = $this.data("starthour");
            var endHour = $this.data("endhour");
            var startMinute = $this.data("startminute");
            var endMinute = $this.data("endminute");
            var weekday = $this.data("weekday");

            var width = $this.width();
            var height = $this.height();
            var offset = $this.offset();

            // if is sunday hover box should be presented to the left of the event
            if (weekday == 6) {
              $eventHoverContainer.css("left", offset.left - 400);
            }
            else {
              $eventHoverContainer.css("left", offset.left - 100 + width);
            }


            $eventHoverContainer.css("top", offset.top - height);

            $eventHoverContainer.find(".event-hover-name").text(name);
            $eventHoverContainer.find(".event-hover-adress").text(address);
            $eventHoverContainer.find(".event-hover-startHour").text(startHour + " : " + startMinute);
            $eventHoverContainer.find(".event-hover-endHour").text(endHour + " : " + endMinute);

            $eventHoverContainer.show();
          },
          mouseleave: function () {
            $eventHoverContainer.hide();
          }
        }, '.event-rectangle');
      }

      $mainContainer.on({
        mouseenter: function () {
          $(this).css({
            "cursor": "pointer",
            "color": "white"
          });
        },
        mouseleave: function () {
          $(this).css({
            "cursor": "auto",
            "color": "rgb(232,232,232)"
          });
        }
      }, '.event-rectangle-details');

      //TODO: since also using css : hover, maybe remove jquery code?
      //$( ".hover-cursor-pointer" ).hover( function ()
      //{
      //	$( this ).css( {
      //		"cursor": "pointer"
      //	} );
      //}, function ()
      //{
      //	$( this ).css( {
      //		"cursor": "auto"
      //	} );
      //} );

      //TODO: since also using css : hover, maybe remove jquery code?
      //$( ".link" ).hover( function ()
      //{
      //	$( this ).css( {
      //		"cursor": "pointer"
      //	} );
      //}, function ()
      //{
      //	$( this ).css( {
      //		"cursor": "auto"
      //	} );
      //} );

      $mainContainer.on({
        mouseenter: function () {
          var $this = $(this);
          if (!$this.hasClass("main-page-link")) {
            $this.toggleClass("selected-nav-link");
            $this.parent().children().first().toggleClass("selected-nav-link");
          }
        },
        mouseleave: function () {
          var $this = $(this);
          if (!$this.hasClass("main-page-link")) {
            $this.toggleClass("selected-nav-link");
            $this.parent().children().first().toggleClass("selected-nav-link");
          }
        }
      }, '.lobby-nav-link-container');

      $mainContainer.on({
        mouseenter: function () {
          $(this).css("background", "rgb(160, 243, 169)");
        },
        mouseleave: function () {
          $(this).css("background", "rgb(225,225,225)");
        }
      }, '.light-icon');

      $mainContainer.on({
        mouseenter: function () {
          $(this).css("background", "rgb(160, 243, 169)");
        },
        mouseleave: function () {
          $(this).css("background", "rgb(188,188,188)");
        }
      }, '.dark-icon');

      $mainContainer.on({
        mouseenter: function () {
          $(this).css({
            "cursor": "pointer"
          });
        },
        mouseleave: function () {
          $(this).css({
            "cursor": "auto"
          });
        }
      }, ".month-name-calendar");

      //$mainContainer.on( {
      //	mouseenter: function ()
      //	{
      //		$( this ).css( {
      //			"cursor": "pointer",
      //			"border-left": "2px solid gray"
      //		} );
      //	},
      //	mouseleave: function ()
      //	{
      //		$( this ).css( {
      //			"cursor": "auto",
      //			"border-left": "none"
      //		} );
      //	}
      //}, ".display-events-overview-item" );


      $(".menu-item-container").hover(function () {
        var $this = $(this);
        if (!$this.hasClass("selected")) {
          $this.css({
            "cursor": "pointer",
            "border": "2px solid gray",
            "border-left": "2px solid #E4E0D1",
            "border-right": "2px solid #E4E0D1"
          });
        }
        else {
          $this.css({
            "border-top": "2px solid gray"
          });
        }

      }, function () {
        var $this = $(this);

        if (!$this.hasClass("selected")) {
          $this.css({
            "cursor": "auto",
            "border": "2px solid #E4E0D1",
            "border-top": "2px solid #E4E0D1"
          });
        } else {
          $this.css({
            "border": "2px solid gray",
            "border-left": "2px solid #E4E0D1",
            "border-right": "2px solid #E4E0D1",
            "border-top": "2px solid #E4E0D1"
          });
        }
      });

      var $leftSideCalendar = $("#leftSideCalendar");
      var $rightSideCalendar = $("#rightSideCalendar");
      var $leftSideDetails = $("#leftSideDetails");
      var $rightSideLobby = $("#rightSideLobby");
      var $rightSideLobbyTopPart = $("#rightSideLobbyTopPart");

      $leftSideCalendar.hover(function () {
        $(this).css({
          "backgroundPosition": "left",
          "cursor": "pointer"
        });
      }, function () {
        $(this).css({
          "backgroundPosition": "right",
          "cursor": "auto"
        });
      });
      $("#calendar-navigation-arrows-left").hover(function () {
        $(this).css({
          "cursor": "pointer"
        });

        $leftSideCalendar.css({
          "backgroundPosition": "left"
        });
      }, function () {
        $(this).css({
          "cursor": "auto"
        });
        $leftSideCalendar.css({
          "backgroundPosition": "right"
        });
      });
      $rightSideCalendar.hover(function () {
        $(this).css({
          "backgroundPosition": "right",
          "cursor": "pointer"
        });
      }, function () {
        $(this).css({
          "backgroundPosition": "left",
          "cursor": "auto"
        });
      });
      $("#calendar-navigation-arrows-right").hover(function () {
        $(this).css({
          "cursor": "pointer"
        });

        $rightSideCalendar.css({
          "backgroundPosition": "right"
        });
      }, function () {
        $(this).css({
          "cursor": "auto"
        });
        $rightSideCalendar.css({
          "backgroundPosition": "left"

        });
      });

      $("#lobby-navigation-arrows-right").hover(function () {
        $(this).css({
          "cursor": "pointer"
        });

        $rightSideLobby.css({
          "backgroundPosition": "right"

        });

        $rightSideLobbyTopPart.css({
          "backgroundPosition": "right"

        });

      }, function () {
        $(this).css({
          "cursor": "auto"
        });
        $rightSideLobby.css({
          "backgroundPosition": "left"

        });

        $rightSideLobbyTopPart.css({
          "backgroundPosition": "left"

        });
      });

      $("#details-navigation-arrows-left").hover(function () {
        $(this).css({
          "cursor": "pointer"
        });

        $leftSideDetails.css({
          "backgroundPosition": "left"

        });
      }, function () {
        $(this).css({
          "cursor": "auto"
        });
        $leftSideDetails.css({
          "backgroundPosition": "right"

        });
      });
      $leftSideDetails.hover(function () {
        $(this).css({
          "backgroundPosition": "left",
          "cursor": "pointer"
        });
      }, function () {
        $(this).css({
          "backgroundPosition": "right",
          "cursor": "auto"
        });
      });

      $rightSideLobby.hover(function () {
        $(this).css({
          "backgroundPosition": "right",
          "cursor": "pointer"
        });

        $rightSideLobbyTopPart.css({
          "backgroundPosition": "right"

        });

      }, function () {
        $(this).css({
          "backgroundPosition": "left",
          "cursor": "auto"
        });

        $rightSideLobbyTopPart.css({
          "backgroundPosition": "left"

        });
      });

      $rightSideLobbyTopPart.hover(function () {
        $(this).css({
          "backgroundPosition": "right",
          "cursor": "pointer"
        });

        $rightSideLobby.css({
          "backgroundPosition": "right"

        });

      }, function () {
        $(this).css({
          "backgroundPosition": "left",
          "cursor": "auto"
        });

        $rightSideLobby.css({
          "backgroundPosition": "left"

        });
      });

      $("#btnAddNewEvent").hover(function () {
        $(this).css({
          "cursor": "pointer"
        });
      }, function () {
        $(this).css({
          "cursor": "auto"
        });
      });

      $(".login-link").hover(function () {
        $(this).css({
          "color": "rgb(73, 226, 140)"
        });
      }, function () {
        $(this).css({
          "color": "gray"
        });
      });

      $("#calendar .calendar-year-arrows").hover(function () {
        $(this).css({
          "cursor": "pointer"
        });

      }, function () {
        $(this).css({
          "cursor": "auto"
        });

      });

      $mainContainer.on({
        mouseenter: function () {
          $(this).css({
            "font-style": "italic"
          });
        },
        mouseleave: function () {
          $(this).css({
            "font-style": "normal"
          });
        }
      }, ".event-block-user-option");

    }();

    this.initializeClick = function () {

      //register user
      var $txtbox = $("#registerPageContainer .register-birthdate-txtbox");
      $txtbox.keyup(function () {
        $("#registerPageContainer #birthDateValidationErrorMsg").hide();
        $txtbox.removeClass("input-validation-error");
      });

      var $mainContainer = $("#mainContainer");

      $mainContainer.on("click", "#leftSideCalendar", function (event) {
        window.location = "#0";
      });
      $mainContainer.on("click", "#calendar-navigation-arrows-left", function (event) {
        window.location = "#0";
      });
      $mainContainer.on("click", "#rightSideCalendar", function (event) {
        window.location = "#2";
      });
      $mainContainer.on("click", "#calendar-navigation-arrows-right", function (event) {
        window.location = "#2";
      });
      $mainContainer.on("click", "#rightSideLobby", function (event) {
        window.location = "#1";
      });
      $mainContainer.on("click", "#lobby-navigation-arrows-right", function (event) {
        window.location = "#1";
      });
      $mainContainer.on("click", "#leftSideDetails", function (event) {
        window.location = "#1";
      });
      $mainContainer.on("click", "#details-navigation-arrows-left", function (event) {
        window.location = "#1";
      });
      $mainContainer.on("click", ".page-overlay", function (event) {
        var $confPopoupBox = $("#mainContainer").children(".confirmation-popupbox");
        $confPopoupBox.find(".confirmation-popupbox-yesbtn").attr("data-bind", '');
        $confPopoupBox.hide();
        $(this).hide();

      });

    }();

    this.initializeDateValidationErrorMsgDisplay = function () {

      var $txtbox = $("#addNewEventContainer .event-startdate-txtbox");
      $txtbox.keyup(function () {
        $("#addNewEventContainer #dateValidationErrorMsg").hide();
        $txtbox.removeClass("input-validation-error");
      });

      var $endDate = $("#addNewEventContainer .end-date-selectbox");
      $endDate.change(function () {
        $endDate.removeClass("input-validation-error");
        $("#addNewEventContainer #endDateValidationErrorMsg").hide();
      });

    }();
  }
};