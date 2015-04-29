﻿var Program = {
	indexViewModel: null,

	initializeJQueryExtentionMethods: function ()
	{
		//scrollTo
		jQuery.fn.extend( {
			scrollTo: function ( speed, offset )
			{
				if ( !offset )
				{
					offset = this.offset().top - 20;
				}

				this.closest( ".scrollable" ).animate( { scrollTop: offset }, speed );
			}
		} );
	},
	initializeAndStartSpinner: function ()
	{
		//////////////////////////////////////////////////////////
		//ajax loader (spinner)
		//////////////////////////////////////////////////////////
		var opts = {
			lines: 17, // The number of lines to draw
			length: 17, // The length of each line
			width: 4, // The line thickness
			radius: 20, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#FFF', // #rgb or #rrggbb or array of colors
			speed: 1, // Rounds per second
			trail: 80, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: '50%', // Top position relative to parent
			left: '50%' // Left position relative to parent
		};

		this.spinner = new Spinner( opts );

		//used in jquery.superslides to turn spinner off when superslides fades in.
		window.spinner = this.spinner;

		var $target = $( "#spinnerContainer" );

		//Get the window height and width
		var winH = $( window ).height();
		var winW = $( window ).width();

		//Set the popup window to center
		$target.css( 'top', winH / 2 - $target.height() / 2 );
		$target.css( 'left', winW / 2 - $target.width() / 2 );

		this.spinner.spin( $target[0] );
		$target.show();
	},
	initialize: function ( indexViewModel, userName )
	{

		var $calendar = $( "#calendar" );
		var $details = $( "#details" );
		var $lobby = $( "#lobby" );
		var eventTreeBuilder = new EventTreeBuilder();

		var date = new Date();
		$calendar.calendarWidget( {
			month: date.getMonth(), year: date.getFullYear()
		} );

		var currentWeekday = $calendar.find( ".today-cell" ).attr( "weekday" );
		var calendarViewModel = new CalendarViewModel( date.getFullYear(), date.getMonth(), date.getDate(), currentWeekday, userName, this.spinner );

		calendarViewModel.eventPrivacyLevels = indexViewModel.PrivacyLevels;
		calendarViewModel.eventKinds = indexViewModel.EventKinds;
		calendarViewModel.publicEventTree = eventTreeBuilder.buildEventTree( indexViewModel.PublicEvents, calendarViewModel, true );
		calendarViewModel.publicEventTreeCountBasedOnEventKind = eventTreeBuilder.buildEventTreeCountBasedOnEventKind( indexViewModel.PublicEventCountTree, calendarViewModel.eventKinds );
		calendarViewModel.newsEvents = eventTreeBuilder.transformNews( indexViewModel.News );

		if ( indexViewModel.MyEvents )
		{
			calendarViewModel.myEventTree = eventTreeBuilder.buildEventTree( indexViewModel.MyEvents, calendarViewModel, false );
			calendarViewModel.myEventTreeCountBasedOnEventKind = eventTreeBuilder.buildEventTreeCountBasedOnEventKind( indexViewModel.MyEventCountTree, calendarViewModel.eventKinds );

			//console.log(JSON.stringify(calendarViewModel.myEventTree));
			//console.log(calendarViewModel.myEventTree);

			//console.log(calendarViewModel.publicEvents);
			//console.log(calendarViewModel.publicEventTree);
			//console.log(calendarViewModel.publicEventTreeCountBasedOnEventKind);
			//console.log( calendarViewModel.publicEventTreeCountBasedOnEventKind );

			/////////////////////////////////////////////////////////////////////////
			//draw events to the calendar
			/////////////////////////////////////////////////////////////////////////
			var yearProp = calendarViewModel.myEventTree[calendarViewModel.calendarPageDisplayDate.year()];
			var events, month, nextMonth, prevMonth, event, calendarPageMonth = calendarViewModel.calendarPageDisplayDate.month();


			//TODO: what about december of previous year and january of next year? are events drawn properly for those cases?
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

							calendarViewModel.drawEventToCalendar( event );
						}
					}
				}
				prevMonth = yearProp[calendarPageMonth - 1];
				if ( prevMonth )
				{
					for ( var days in prevMonth )
					{
						events = prevMonth[days];
						for ( var i = 0; i < events.length; i++ )
						{
							event = events[i];

							calendarViewModel.drawEventToCalendar( event );
						}
					}
				}
				nextMonth = yearProp[calendarPageMonth + 1];
				if ( nextMonth )
				{
					for ( var days in nextMonth )
					{
						events = nextMonth[days];
						for ( var i = 0; i < events.length; i++ )
						{
							event = events[i];

							calendarViewModel.drawEventToCalendar( event );
						}
					}
				}
			}
		}

		//////////////////////////////////////////////////////////////////
		//initialize details page
		//////////////////////////////////////////////////////////////////
		calendarViewModel.displayPageEventMostBottomRow = 1;
		calendarViewModel.detailsPageDisplayDate.year( date.getFullYear() );
		calendarViewModel.detailsPageDisplayDate.month( date.getMonth() + 1 );
		calendarViewModel.detailsPageDisplayDate.day( date.getDate() );
		calendarViewModel.detailsPageDisplayDate.weekday( currentWeekday );

		var events = calendarViewModel.getEventsForGivenDay( date.getDate() )
		calendarViewModel.detailsPageDayEvents( events );
		///////////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////F///
		//Knockout apply bindings
		///////////////////////////////////////////////////////////////////
		ko.applyBindings( calendarViewModel );
		///////////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////
		//draw to details page
		//////////////////////////////////////////////////////////////////

		//method drawEventToDetailsDayTable(events[i]) needs to be called after ko.applyBindings(calendarViewModel)!
		for ( var i in events )
		{
			calendarViewModel.drawEventToDetailsDayTable( events[i] );
		}

		var $tableBody = $( "#calendarDayDetailsTable .table-details-body" );
		var h = ( calendarViewModel.displayPageEventMostBottomRow + 1 ) * 46;
		$tableBody.height( h + "px" );
		///////////////////////////////////////////////////////////////////

		this.initializeSlides = function ()
		{
			location.hash = '#0';

			$( '#slides' ).superslides( {
				slide_easing: 'easeInOutCubic',
				slide_speed: 600,
				pagination: true,
				hashchange: true,
				scrollable: true
			} );

			$( window ).on( "hashchange", function ()
			{
				setTimeout( function ()
				{
					if ( location.hash === "#0" )
					{
						calendarViewModel.currentPage = 0;
					}
					else if ( location.hash === "#1" )
					{
						calendarViewModel.currentPage = 1;

						if ( calendarViewModel.calendarDayEventsToUpdate.events !== null )
						{
							setTimeout( function ()
							{
								calendarViewModel.redrawCalendarCell( calendarViewModel.calendarDayEventsToUpdate.events, calendarViewModel.calendarDayEventsToUpdate.day );
								calendarViewModel.calendarDayEventsToUpdate.events = null;

							}, 10 )
						}

						//TODO: not finished set dynamic height of calendar cells (calendar to be as height as browser window)
						//setTimeout(function(){				

						//	var height1 = $("#calendar #calendarMenuHeader").height();
						//	var height2 = $("#calendar .weekday-container").height();
						//	var height3 = $("#calendar .calendar-hours-placeholder").first().height();
						//	var height4 = 42;
						//	var winHeight = $(window).height();

						//	var cellHeight = (winHeight - (height1 + height2 + height3 + 60)) / 6;

						//	$("#calendar .calendar-cell").css("height", cellHeight);

						//	console.log(cellHeight);

						//}, 10)

					}
					else if ( location.hash === "#2" )
					{
						calendarViewModel.currentPage = 2;
					}
				}, 10 );
			} );

			$( ".slides-pagination a" ).on( "click", function ()
			{
				var hash = $( this ).attr( "href" );

				if ( hash === "#2" )
				{
					var $scrollable = $( "#slide-item-details" ).parent();

					setTimeout( function ()
					{
						$scrollable.scrollTop( 0 );
					}, 10 )
				}
			} );
		}();

		this.createCalendarNavigationArrows = function ()
		{
			$calendar.append( '<div id="calendar-navigation-arrows-left"><img src="Images/Nav/arrowLeft.png" alt="arrow-left"/></div>' );
			$calendar.append( '<div id="calendar-navigation-arrows-right"><img src="Images/Nav/arrowRight.png" alt="arrow-Right"/></div>' );
			$details.append( '<div id="details-navigation-arrows-left"><img src="Images/Nav/arrowLeft.png" alt="arrow-Left"/></div>' );
			$lobby.append( '<div id="lobby-navigation-arrows-right"><img src="Images/Nav/arrowRight.png" alt="arrow-Right"/></div>' );
		}();

		this.drawClocks = function ()
		{
			calendarViewModel.drawAnalogClock();
			calendarViewModel.drawDigitalClock();
		}();

		this.initializeHover = function ()
		{

			var $container = $( ".event-hover-container" );
			var $mainContainer = $( "#mainContainer" );

			$mainContainer.on( {
				mouseenter: function ()
				{

					var name = $( this ).find( "input" ).attr( "name" );
					var address = $( this ).find( "input" ).attr( "address" );
					var startHour = $( this ).find( "input" ).attr( "starthour" );
					var endHour = $( this ).find( "input" ).attr( "endhour" );
					var startMinute = $( this ).find( "input" ).attr( "startminute" );
					var endMinute = $( this ).find( "input" ).attr( "endminute" );

					var width = $( this ).width();
					var height = $( this ).height();
					var offset = $( this ).offset();

					$container.css( "left", offset.left - 100 + width );
					$container.css( "top", offset.top - height );

					$container.find( ".event-hover-name" ).text( name );
					$container.find( ".event-hover-adress" ).text( address );
					$container.find( ".event-hover-startHour" ).text( startHour + " : " + startMinute );
					$container.find( ".event-hover-endHour" ).text( endHour + " : " + endMinute );

					$container.show();
				},
				mouseleave: function ()
				{
					$container.hide();
				}
			}, '.event-rectangle' );

			//TODO: since also using css : hover, maybe remove jquery code?
			$( ".hover-cursor-pointer" ).hover( function ()
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

			//TODO: since also using css : hover, maybe remove jquery code?
			$( ".link" ).hover( function ()
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

			$mainContainer.on( {
				mouseenter: function ()
				{
					if ( !$(this).hasClass("main-page-link") )
					{
						$( this ).toggleClass( "selected-nav-link" );
						$( this ).parent().children().first().toggleClass( "selected-nav-link" );
					}				
				},
				mouseleave: function ()
				{
					if ( !$( this ).hasClass( "main-page-link" ) )
					{
						$( this ).toggleClass( "selected-nav-link" );
						$( this ).parent().children().first().toggleClass( "selected-nav-link" );
					}
				}
			}, '.lobby-nav-link-container' );


			$mainContainer.on( {
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

			$mainContainer.on( {
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

			$mainContainer.on( {
				mouseenter: function ()
				{
					$( this ).css( "background", "rgb(160, 243, 169)" );
				},
				mouseleave: function ()
				{
					$( this ).css( "background", "rgb(225,225,225)" );
				}
			}, '.light-icon' );

			$mainContainer.on( {
				mouseenter: function ()
				{
					$( this ).css( "background", "rgb(160, 243, 169)" );
				},
				mouseleave: function ()
				{
					$( this ).css( "background", "rgb(188,188,188)" );
				}
			}, '.dark-icon' );

			$mainContainer.on( {
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

			$( ".menu-item-container" ).hover( function ()
			{
				$( this ).css( {
					"cursor": "pointer",
					"box-shadow": "4px 2px 8px rgb(196, 194, 184)",
					"border": "1px solid white"
				} );
			}, function ()
			{
				var $this = $( this );
				$this.css( {
					"cursor": "auto",
					"box-shadow": "none",
					"border": "none"
				} );

				//if (!$this.hasClass("selected")) {
				//	$this.css({						
				//		"background": "rgb(245, 240, 223)"
				//	});
				//}
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

			var $mainContainer = $( "#mainContainer" );

			$mainContainer.on( "click", "#leftSideCalendar", function ( event )
			{
				window.location = "#0";
			} );
			$mainContainer.on( "click", "#calendar-navigation-arrows-left", function ( event )
			{
				window.location = "#0";
			} );
			$mainContainer.on( "click", "#rightSideCalendar", function ( event )
			{
				window.location = "#2";
			} );
			$mainContainer.on( "click", "#calendar-navigation-arrows-right", function ( event )
			{
				window.location = "#2";
			} );
			$mainContainer.on( "click", "#rightSideLobby", function ( event )
			{
				window.location = "#1";
			} );
			$mainContainer.on( "click", "#lobby-navigation-arrows-right", function ( event )
			{
				window.location = "#1";
			} );
			$mainContainer.on( "click", "#leftSideDetails", function ( event )
			{
				window.location = "#1";
			} );
			$mainContainer.on( "click", "#details-navigation-arrows-left", function ( event )
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
	}
};