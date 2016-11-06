var App = {
	indexViewModel: null,
	initializeJQueryExtentionMethods: function ( simpleFilt )
	{
		jQuery.fn.extend( {
			scrollTo: function ( speed, offset )
			{
				if ( typeof offset === undefined )
				{
					offset = 0;
				}

				var $col = this.closest( ".dz-column" );
				var scrollTo = this.offset().top - $col.offset().top + $col.scrollTop() - offset;
				$col.animate( { scrollTop: scrollTo }, speed );
			}
		} );

		jQuery.extend( {
			simpleFilt: simpleFilt
		} )
	},
	initializeLoader: function ()
	{
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

		var spinner = new Spinner( opts );
		var $target = $( "#spinnerContainer" );

		//Get the window height and width
		var winH = $( window ).height();
		var winW = $( window ).width();

		//Set the popup window to center
		$target.css( 'top', winH / 2 - $target.height() / 2 );
		$target.css( 'left', winW / 2 - $target.width() / 2 - 20 );
		return spinner;
	},
	initializeEventGrid: function ()
	{
		var $container = $( '#lobby .grid' );
		//layout Masonry again after all images have loaded
		$container.imagesLoaded( function ()
		{
			$container.masonry( {
				itemSelector: '.event-block-container'
			} );
		} );
	},
	initializeSiteLoadingText: function ()
	{
		var textArr = ["Z", "N", "A", "J", "D", "Ź", " ", "C", "Z", "A", "S", " ", "N", "A", " ", "S", "U", "K", "C", "E", "S"];
		var spanOpened = "<span>", spanClosed = "</span>";
		var output = "";

		for ( var i = 0; i < textArr.length; i++ )
		{
			output += spanOpened + textArr[i] + spanClosed;
		}

		$( "#pageOverlayAtSiteLoadText" ).html( output );
	},
	animateSiteLoadingText: function ( siteLoadingTextAnimationInterval )
	{
		var $spans = $( "#pageOverlayAtSiteLoadText" ).children();
		var counter = 0;

		siteLoadingTextAnimationInterval.interval = setInterval( function () { animate( $spans ) }, 50 );

		function animate( $spans )
		{
			if ( counter > 0 )
			{
				$spans[counter - 1].style.color = "gray";
			}
			else if ( counter == 0 )
			{
				$spans[$spans.length - 1].style.color = "gray";
			}

			if ( counter != $spans.length )
			{
				$spans[counter].style.color = "#E4E4DA";
				counter++;
			} else
			{
				counter = 0;
			}
		}
	},
	initializeDzieuoPlugin: function ( $dzieuo )
	{
		$dzieuo.dzieuo( {
			row_scroll_padding_top: 30
		} );
	},
	displaySiteAfterLoad: function ( siteLoadingTextAnimationInterval, $dzieuo )
	{
		setTimeout( function ()
		{
			clearInterval( siteLoadingTextAnimationInterval.interval );
			$( "#pageOverlayAtSiteLoad" ).hide();
			$dzieuo.css( "visibility", "visible" );
		}, 1050 );
	},
	setPagesHeights: function ()
	{
		var height = $( window ).height() - 30;
		$( "#lobby" ).css( "height", height );
		$( "#details" ).css( "height", height );
		$( "#calendar" ).css( "height", height );

	},
	initializeApp: function ( indexViewModel, userName, spinner )
	{
		"use strict";

		var $calendar = $( "#calendarWidget" );
		var $details = $( "#details" );
		var $lobby = $( "#lobby" );

		var year, month, day;
		var date = new Date();
		year = date.getFullYear();
		month = date.getMonth();
		day = date.getDate();

		$calendar.calendarWidget( {
			month: month, year: year
		} );

		var appvm = new AppViewModel( date, userName, spinner );
		var UTILS = appvm.UTILS;
		var EVENT_MANAGER = appvm.EVENT_MANAGER;
		var NOTE_MANAGER = appvm.NOTE_MANAGER;

		appvm.eventPrivacyLevels = UTILS.eventTreeBuilder.transformPrivacyLevels( indexViewModel.PrivacyLevels );
		appvm.eventKinds = indexViewModel.EventKinds;

		appvm.publicEventTree = UTILS.eventTreeBuilder.buildEventTree( indexViewModel.PublicEvents, true );
		appvm.lobbyPage.upcomingEventsPart.publicEventTreeCountBasedOnEventKindVM = UTILS.eventTreeBuilder.buildEventTreeCountBasedOnEventKind(indexViewModel.PublicEventCountTree, appvm.eventKinds);

		appvm.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM( getRecentlyAddedEvents( appvm ) );
		appvm.lobbyPage.dashboardPart.upcomingPublicEventsVM( UTILS.eventTreeBuilder.transformEventListToKKEventList( indexViewModel.UpcomingPublicEvents ) );

		//appViewModel.newsEvents = appViewModel.UTILS.eventTreeBuilder.transformNews( indexViewModel.News );

		//When user is logged in
		if ( indexViewModel.MyEvents )
		{
			appvm.myEventTree = UTILS.eventTreeBuilder.buildEventTree( indexViewModel.MyEvents, false );
			appvm.myEventTreeCountBasedOnEventKind = UTILS.eventTreeBuilder.buildEventTreeCountBasedOnEventKind( indexViewModel.MyEventCountTree, appvm.eventKinds );

			appvm.myNoteTree = UTILS.eventTreeBuilder.buildNoteTree( indexViewModel.MyNotes );
			appvm.lobbyPage.dashboardPart.myCalendarVM.today( EVENT_MANAGER.getEventsForGivenDay(year, month + 1, day, appvm.myEventTree) );
			appvm.lobbyPage.dashboardPart.myCalendarVM.tommorow( EVENT_MANAGER.getEventsForGivenDay( year, month + 1, day + 1, appvm.myEventTree ) );
			appvm.lobbyPage.dashboardPart.myCalendarVM.dayAfterTommorow(EVENT_MANAGER.getEventsForGivenDay( year, month + 1, day + 2, appvm.myEventTree) );

			/////////////////////////////////////////////////////////////////////////
			//draw events to the calendar
			/////////////////////////////////////////////////////////////////////////

			var yearProp = appvm.myEventTree[appvm.calendarPageDisplayDate.year()];
			var events, month, nextMonth, prevMonth, event, calendarPageMonth = appvm.calendarPageDisplayDate.month();

			// current month
			if ( yearProp )
			{
				month = yearProp[calendarPageMonth]
				if ( month )
				{
					for ( var days in month )
					{
						events = month[days];
						for ( var i = 0; i < events.length; i++ )
						{
							event = events[i];

							appvm.drawEventToCalendar( event );
						}
					}
				}
			}
			// prev month
			if ( appvm.calendarPageDisplayDate.month() == 1 )
			{
				calendarPageMonth = 12;
				yearProp = appvm.myEventTree[appvm.calendarPageDisplayDate.year() - 1];
			}
			else
			{
				calendarPageMonth = calendarPageMonth - 1;
			}

			if ( yearProp )
			{
				prevMonth = yearProp[calendarPageMonth];
				if ( prevMonth )
				{
					for ( var days in prevMonth )
					{
						events = prevMonth[days];
						for ( var i = 0; i < events.length; i++ )
						{
							event = events[i];

							appvm.drawEventToCalendar( event );
						}
					}
				}
			}

			// next month
			if ( appvm.calendarPageDisplayDate.month() == 12 )
			{
				calendarPageMonth = 1;
				yearProp = appvm.myEventTree[appvm.calendarPageDisplayDate.year() + 1];
			}
			else
			{
				calendarPageMonth = calendarPageMonth + 1;
			}

			if ( yearProp )
			{
				nextMonth = yearProp[calendarPageMonth];
				if ( nextMonth )
				{
					for ( var days in nextMonth )
					{
						events = nextMonth[days];
						for ( var i = 0; i < events.length; i++ )
						{
							event = events[i];

							appvm.drawEventToCalendar( event );
						}
					}
				}
			}
		}

		//////////////////////////////////////////////////////////////////
		//initialize details page
		//////////////////////////////////////////////////////////////////
		appvm.detailsPageEventMostBottomRow = 1;
		appvm.detailsPageDisplayDate.year( date.getFullYear() );
		appvm.detailsPageDisplayDate.month( date.getMonth() + 1 );
		appvm.detailsPageDisplayDate.day( date.getDate() );

		var events = EVENT_MANAGER.getEventsForGivenDay( appvm.detailsPageDisplayDate.year(), appvm.detailsPageDisplayDate.month(), appvm.detailsPageDisplayDate.day(), appvm.myEventTree )
		var notes = NOTE_MANAGER.getNotesForGivenDay( appvm.detailsPageDisplayDate.year(), appvm.detailsPageDisplayDate.month(), appvm.detailsPageDisplayDate.day() )
		appvm.detailsPageDayEvents( events );
		appvm.detailsPageDayNotes( notes );
		///////////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////
		//Knockout apply bindings
		///////////////////////////////////////////////////////////////////
		ko.applyBindings( appvm );
		///////////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////
		//draw to details page
		///////////////////////////////////////////////////////////////////

		//method drawEventToDetailsDayTable(events[i]) needs to be called after ko.applyBindings(appvm)!
		for ( var i in events )
		{
			appvm.drawEventToDetailsDayTable( events[i] );
		}

		var $tableBody = $( "#detailsDayTable .details-day-table-body" );
		var h = ( appvm.detailsPageEventMostBottomRow ) * 46;
		h = h + 20;
		$tableBody.height( h + "px" );
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
		//            var events = appvm.calendarDayEventsToUpdate.events;

		//            if (location.hash === "#0") {
		//                appvm.currentPage() = 0;
		//            }
		//            else if (location.hash === "#1") {
		//                appvm.currentPage() = 1;

		//                if (events && $.isArray(events)) {
		//                    //setTimeout( function ()
		//                    //{
		//                    appvm.redrawCalendarCell(events, appvm.calendarDayEventsToUpdate.day, appvm.calendarDayEventsToUpdate.month, appvm.calendarDayEventsToUpdate.year);
		//                    appvm.calendarDayEventsToUpdate.events = null;
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
		//                appvm.currentPage() = 2;
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
		//    appvm.drawAnalogClock();
		//    appvm.drawDigitalClock();
		//}();

		$( "#dzVerticalPaging" ).addClass( "xs-hide" );

		this.initializeHover = function ()
		{
			var $eventHoverContainer = $( "#eventHoverContainer" );
			var $appContainer = $( "#appContainer" );
			var tap = ( "ontouchstart" in document.documentElement );

			if ( !tap )
			{
				$appContainer.on( {
					mouseenter: function ()
					{
						$( this ).css( {
							"border-bottom": "2px solid rgb(235,235,235)",
							"border-top": "2px solid rgb(250,250,250)",
							"cursor": "pointer",
							"top": "3px"
						} ).find( ".addNewEvent-cellIcon" ).fadeIn();
					},
					mouseleave: function ()
					{
						$( this ).css( {
							"border": "2px solid white",
							"cursor": "auto",
							"top": "0"
						} ).find( ".addNewEvent-cellIcon" ).hide();
					}
				}, '.current-month-cell' );

				$appContainer.on( {
					mouseenter: function ()
					{
						$( this ).css( {
							"cursor": "pointer",
							"top": "3px"
						} ).find( ".addNewEvent-cellIcon" ).fadeIn();
					},
					mouseleave: function ()
					{
						$( this ).css( {
							"cursor": "auto",
							"top": "0px"
						} ).find( ".addNewEvent-cellIcon" ).fadeOut();
					}
				}, '.other-month-cell' );

				$appContainer.on( {
					mouseenter: function ()
					{
						var $this = $( this );
						var name = $this.data( "name" );
						var address = $this.data( "address" );
						var startHour = $this.data( "starthour" );
						var endHour = $this.data( "endhour" );
						var startMinute = $this.data( "startminute" );
						var endMinute = $this.data( "endminute" );
						var weekday = $this.data( "weekday" );

						var width = $this.width();
						var height = $this.height();
						var offset = $this.offset();

						// if is sunday hover box should be presented to the left of the event
						if ( weekday == 6 )
						{
							$eventHoverContainer.css( "left", offset.left - 400 );
						}
						else
						{
							$eventHoverContainer.css( "left", offset.left - 100 + width );
						}


						$eventHoverContainer.css( "top", offset.top - height );

						$eventHoverContainer.find( ".event-hover-name" ).text( name );
						$eventHoverContainer.find( ".event-hover-adress" ).text( address );
						$eventHoverContainer.find( ".event-hover-startHour" ).text( startHour + " : " + startMinute );
						$eventHoverContainer.find( ".event-hover-endHour" ).text( endHour + " : " + endMinute );

						$eventHoverContainer.show();
					},
					mouseleave: function ()
					{
						$eventHoverContainer.hide();
					}
				}, '.event-rectangle' );
			}

			$appContainer.on( {
				mouseenter: function ()
				{
					$( this ).css( {
						"cursor": "pointer",
						"color": "rgb(232,232,232)"
					} );
				},
				mouseleave: function ()
				{
					$( this ).css( {
						"cursor": "auto",
						"color": "gray"
					} );
				}
			}, '.event-rectangle-details' );

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

			$appContainer.on( {
				mouseenter: function ()
				{
					var $this = $( this );
					if ( !$this.hasClass( "main-page-link" ) )
					{
						$this.toggleClass( "selected-nav-link" );
						$this.parent().children().first().toggleClass( "selected-nav-link" );
					}
				},
				mouseleave: function ()
				{
					var $this = $( this );
					if ( !$this.hasClass( "main-page-link" ) )
					{
						$this.toggleClass( "selected-nav-link" );
						$this.parent().children().first().toggleClass( "selected-nav-link" );
					}
				}
			}, '.lobby-nav-link-container' );

			$appContainer.on( {
				mouseenter: function ()
				{
					$( this ).css( "background", "rgb(160, 243, 169)" );
				},
				mouseleave: function ()
				{
					$( this ).css( "background", "rgb(225,225,225)" );
				}
			}, '.light-icon' );

			$appContainer.on( {
				mouseenter: function ()
				{
					$( this ).css( "background", "rgb(160, 243, 169)" );
				},
				mouseleave: function ()
				{
					$( this ).css( "background", "rgb(188,188,188)" );
				}
			}, '.dark-icon' );

			$appContainer.on( {
				mouseenter: function ()
				{
					$( this ).css( {
						"cursor": "pointer"
					} );
				},
				mouseleave: function ()
				{
					$( this ).css( {
						"cursor": "auto"
					} );
				}
			}, ".month-name-calendar" );

			//$appContainer.on( {
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


			$( ".menu-item-container" ).hover( function ()
			{
				var $this = $( this );

				if ( !$this.hasClass( "selected" ) )
				{
					$this.css( {
						"cursor": "pointer"
					} );
				}
			}, function ()
			{
				var $this = $( this );

				if ( !$this.hasClass( "selected" ) )
				{
					$this.css( {
						"cursor": "auto"
					} );
				}
			} );

			var $leftSideCalendar = $( "#leftSideCalendar" );
			var $rightSideCalendar = $( "#rightSideCalendar" );
			var $leftSideDetails = $( "#leftSideDetails" );
			var $rightSideLobby = $( "#rightSideLobby" );
			var $rightSideLobbyTopPart = $( "#rightSideLobbyTopPart" );

			$leftSideCalendar.hover( function ()
			{
				$( this ).css( {
					"backgroundPosition": "left",
					"cursor": "pointer"
				} );
			}, function ()
			{
				$( this ).css( {
					"backgroundPosition": "right",
					"cursor": "auto"
				} );
			} );
			$( "#calendar-navigation-arrows-left" ).hover( function ()
			{
				$( this ).css( {
					"cursor": "pointer"
				} );

				$leftSideCalendar.css( {
					"backgroundPosition": "left"
				} );
			}, function ()
			{
				$( this ).css( {
					"cursor": "auto"
				} );
				$leftSideCalendar.css( {
					"backgroundPosition": "right"
				} );
			} );
			$rightSideCalendar.hover( function ()
			{
				$( this ).css( {
					"backgroundPosition": "right",
					"cursor": "pointer"
				} );
			}, function ()
			{
				$( this ).css( {
					"backgroundPosition": "left",
					"cursor": "auto"
				} );
			} );
			$( "#calendar-navigation-arrows-right" ).hover( function ()
			{
				$( this ).css( {
					"cursor": "pointer"
				} );

				$rightSideCalendar.css( {
					"backgroundPosition": "right"
				} );
			}, function ()
			{
				$( this ).css( {
					"cursor": "auto"
				} );
				$rightSideCalendar.css( {
					"backgroundPosition": "left"

				} );
			} );

			$( "#lobby-navigation-arrows-right" ).hover( function ()
			{
				$( this ).css( {
					"cursor": "pointer"
				} );

				$rightSideLobby.css( {
					"backgroundPosition": "right"

				} );

				$rightSideLobbyTopPart.css( {
					"backgroundPosition": "right"

				} );

			}, function ()
			{
				$( this ).css( {
					"cursor": "auto"
				} );
				$rightSideLobby.css( {
					"backgroundPosition": "left"

				} );

				$rightSideLobbyTopPart.css( {
					"backgroundPosition": "left"

				} );
			} );

			$( "#details-navigation-arrows-left" ).hover( function ()
			{
				$( this ).css( {
					"cursor": "pointer"
				} );

				$leftSideDetails.css( {
					"backgroundPosition": "left"

				} );
			}, function ()
			{
				$( this ).css( {
					"cursor": "auto"
				} );
				$leftSideDetails.css( {
					"backgroundPosition": "right"

				} );
			} );
			$leftSideDetails.hover( function ()
			{
				$( this ).css( {
					"backgroundPosition": "left",
					"cursor": "pointer"
				} );
			}, function ()
			{
				$( this ).css( {
					"backgroundPosition": "right",
					"cursor": "auto"
				} );
			} );

			$rightSideLobby.hover( function ()
			{
				$( this ).css( {
					"backgroundPosition": "right",
					"cursor": "pointer"
				} );

				$rightSideLobbyTopPart.css( {
					"backgroundPosition": "right"

				} );

			}, function ()
			{
				$( this ).css( {
					"backgroundPosition": "left",
					"cursor": "auto"
				} );

				$rightSideLobbyTopPart.css( {
					"backgroundPosition": "left"

				} );
			} );

			$rightSideLobbyTopPart.hover( function ()
			{
				$( this ).css( {
					"backgroundPosition": "right",
					"cursor": "pointer"
				} );

				$rightSideLobby.css( {
					"backgroundPosition": "right"

				} );

			}, function ()
			{
				$( this ).css( {
					"backgroundPosition": "left",
					"cursor": "auto"
				} );

				$rightSideLobby.css( {
					"backgroundPosition": "left"

				} );
			} );

			$( "#btnAddNewEvent" ).hover( function ()
			{
				$( this ).css( {
					"cursor": "pointer"
				} );
			}, function ()
			{
				$( this ).css( {
					"cursor": "auto"
				} );
			} );

			$( ".login-link" ).hover( function ()
			{
				$( this ).css( {
					"color": "rgb(73, 226, 140)"
				} );
			}, function ()
			{
				$( this ).css( {
					"color": "gray"
				} );
			} );

			$( "#calendar .calendar-year-arrows" ).hover( function ()
			{
				$( this ).css( {
					"cursor": "pointer"
				} );

			}, function ()
			{
				$( this ).css( {
					"cursor": "auto"
				} );

			} );

			$appContainer.on( {
				mouseenter: function ()
				{
					$( this ).css( {
						"font-style": "italic"
					} );
				},
				mouseleave: function ()
				{
					$( this ).css( {
						"font-style": "normal"
					} );
				}
			}, ".event-block-user-option" );

		}();

		this.initializeClick = function ()
		{

			//register user
			var $txtbox = $( "#registerPageContainer .register-birthdate-txtbox" );
			$txtbox.keyup( function ()
			{
				$( "#registerPageContainer #birthDateValidationErrorMsg" ).hide();
				$txtbox.removeClass( "input-validation-error" );
			} );

			var $appContainer = $( "#appContainer" );

			$appContainer.on( "click", "#leftSideCalendar", function ( event )
			{
				window.location = "#0";
			} );
			$appContainer.on( "click", "#calendar-navigation-arrows-left", function ( event )
			{
				window.location = "#0";
			} );
			$appContainer.on( "click", "#rightSideCalendar", function ( event )
			{
				window.location = "#2";
			} );
			$appContainer.on( "click", "#calendar-navigation-arrows-right", function ( event )
			{
				window.location = "#2";
			} );
			$appContainer.on( "click", "#rightSideLobby", function ( event )
			{
				window.location = "#1";
			} );
			$appContainer.on( "click", "#lobby-navigation-arrows-right", function ( event )
			{
				window.location = "#1";
			} );
			$appContainer.on( "click", "#leftSideDetails", function ( event )
			{
				window.location = "#1";
			} );
			$appContainer.on( "click", "#details-navigation-arrows-left", function ( event )
			{
				window.location = "#1";
			} );
		}();

		this.initializeDateValidationErrorMsgDisplay = function ()
		{

			var $txtbox = $( "#addNewEventContainer .event-startdate-txtbox" );
			$txtbox.keyup( function ()
			{
				$( "#addNewEventContainer #dateValidationErrorMsg" ).hide();
				$txtbox.removeClass( "input-validation-error" );
			} );

			var $endDate = $( "#addNewEventContainer .end-date-selectbox" );
			$endDate.change( function ()
			{
				$endDate.removeClass( "input-validation-error" );
				$( "#addNewEventContainer #endDateValidationErrorMsg" ).hide();
			} );

		}();

		function getRecentlyAddedEvents( appvm )
		{
		  var recentlyAddedEvents = appvm.lobbyPage.eventGridPart.publicEventsVM.sort(function (event1, event2)
			{
				return event1.dateAdded.javaScriptDate - event2.dateAdded.javaScriptDate;
			} );

			return recentlyAddedEvents.slice( Math.max( recentlyAddedEvents.length - 5, 1 ) ).reverse();
		}
	}
};