function AppViewModel( date, userName, spinner )
{
	"use strict";

	var self = this;
	var lobbyVM, calendarVM, detailsVM;

	//////////////////////////////////////////////////////////
	//utils, managers etc
	//////////////////////////////////////////////////////////

	self.UTILS = ( function ()
	{
		var Utils = function ()
		{
			var colorHelper = new EventColorHelper();
			var webApiCaller = new WebApiCaller();
			var eventTreeBuilder = new TreeBuilder( self );

			this.colorHelper = colorHelper;
			this.webApiCaller = webApiCaller;
			this.eventTreeBuilder = eventTreeBuilder;
			this.loader = ( function ()
			{
				var $spinner = $( "#spinnerContainer" );
				var $overlay = $( "#appContainer" ).children( ".page-overlay" );

				return {
					$spinner: $spinner,
					$overlay: $overlay,
					show: function ( shouldDisplayOverlay )
					{
						if ( shouldDisplayOverlay )
						{
							$overlay.show();
						}

						//Get the window height and width
						var winH = $( window ).height();
						var winW = $( window ).width();

						//Set the popup window to center
						$spinner.css( 'top', winH / 2 - $spinner.height() / 2 );
						$spinner.css( 'left', winW / 2 - $spinner.width() / 2 );

						self.spinner.spin( $spinner[0] );
						$spinner.show();
					},
					hide: function ( shouldHideOverlay )
					{
						if ( shouldHideOverlay )
						{
							$overlay.fadeOut();
						}

						self.spinner.stop();
						$spinner.hide();
					}
				}
			}() );
		}
		return new Utils();
	} )();
	self.EVENT_MANAGER = new EventManager( self );
	self.NOTE_MANAGER = new NoteManager( self );

	// pages
	self.lobbyPage = {};
	self.calendarPage = {};
	self.detailsPage = {};

	// lobby page / nav part view models
	self.lobbyPage.navPart = {};

	// lobby page / dashboard part view models
	self.lobbyPage.dashboardPart = {};
	self.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM = ko.observableArray( [] );
	self.lobbyPage.dashboardPart.upcomingPublicEventsVM = ko.observableArray( [] );

	// lobby page / upcoming events part view models
	self.lobbyPage.upcomingEventsPart = {};
	self.lobbyPage.upcomingEventsPart.eventListMenuVM = {
		"menuItems": {
			publicEvents: {
				"index": 1,
				//TODO: maybe change into event tree with arrays grouped by event kind
				"selectedEvents": {
					//it is filled with public events when building publicEventTree
					old: ko.observableArray( [] ),
					upcoming: ko.observableArray( [] )
				},
				"showOld": ko.observable( false ),
				"showUpcoming": ko.observable( true )
			}
		},
		"selectedMenuItem": ko.observable( 1 ),
		"selectedEventKindValues": [],
		"getCurrentSelectedEventsProp": function ()
		{
			switch ( this.selectedMenuItem() )
			{
				case 1:
					return this.menuItems.publicEvents.selectedEvents;
				default:
					return [];
			}
		},
		"isOpen": ko.observable( false )
	}
	self.lobbyPage.eventGridPart = {};

	//////////////////////////////////////////////////////////
	//public properties
	//////////////////////////////////////////////////////////
	var year = date.getFullYear(), month = date.getMonth(), day = date.getDate();

	// ajax loader 
	self.spinner = spinner;

	//0 - lobby page
	//1 - calendar page
	//2 - details page
	self.currentPage = function ()
	{
		return Number( window.location.hash.substring( 1 ) );
	};

	self.todayDate = {
		"javaScriptDate": date,
		"day": day,
		//month starts from 1 to 12
		"month": month + 1,
		"year": year,
		"getMonthName": function ()
		{
			return self.monthNames[( this.month - 1 )];
		},
		"getDayName": function ()
		{
			var weekday = new Date().getDay();
			return weekday == 0 ? self.dayNames[6] : self.dayNames[weekday - 1];
		}
	}

	self.monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
	self.dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
	self.userName = userName;

	self.eventKinds = [];
	self.eventPrivacyLevels = {};

	// is used when adding or editing event
	self.observableEvent = new KKEventModelObservable();

	// is used when adding note
	self.observableNote = new KKNoteModelObservable();


	
	

	//month starts from 1 to 12
	self.calendarPageDisplayDate = {
		"year": ko.observable( year ),
		"month": ko.observable( month + 1 )
	};
	self.calendarPageMonthEvents = [];

	self.detailsPageDisplayDate = {
		"year": ko.observable( year ),
		//month starts from 1 to 12
		"month": ko.observable( month + 1 ),
		"day": ko.observable( day ),
		"getMonthName": function ()
		{
			return self.monthNames[this.month() - 1];
		},
		"getDayName": function ()
		{
			var weekday = new Date( this.year(), this.month() - 1, this.day() ).getDay();
			return weekday == 0 ? self.dayNames[6] : self.dayNames[weekday - 1];
		}
	};

	// used to specify the most bottom row of events in details page in the daily plan table
	self.detailsPageEventMostBottomRow = 1;

	self.detailsPageDayEvents = ko.observableArray( [] );
	self.detailsPageDayNotes = ko.observableArray( [] );

	self.detailsPageJournalMenu = {
		"menuItems": {
			myCalendar: {
				"index": 1,
				//TODO: maybe change into event tree with arrays grouped by event kind
				"selectedEvents": {
					old: ko.observableArray( [] ),
					upcoming: ko.observableArray( [] )
				},
				"showOld": ko.observable( false ),
				"showUpcoming": ko.observable( true )
			},
			manageOwnPublicEvents: {
				"index": 2,
				//TODO: maybe change into event tree with arrays grouped by event kind
				"selectedEvents": {
					// TODO: oldTemp and upcomingTemp are filled when building publicEventTree and then those arrays are put into old/upcoming observale array on showSelectedJournalMenuItem
					// is made this way because otherwise app will throw errors... fix it when you get a chance (remove oldTemp and upcomingTemp)
					oldTemp: [],
					upcomingTemp: [],

					old: ko.observableArray( [] ),
					upcoming: ko.observableArray( [] )
				},
				"showOld": ko.observable( false ),
				"showUpcoming": ko.observable( true )
			}
		},
		"selectedMenuItem": ko.observable( 1 ),
		"getCurrentSelectedEventsProp": function ()
		{
			switch ( this.selectedMenuItem() )
			{
				case 1:
					return this.menuItems.myCalendar.selectedEvents;
				case 2:
					return this.menuItems.manageOwnPublicEvents.selectedEvents;
				default:
					return [];
			}
		},
		"selectedEventKindValues": [],
		"isOpen": ko.observable( false )
	}

	self.newsEvents = [];

	//it is filled with public events when building publicEventTree
	self.publicEvents = ko.observableArray( [] );

	self.publicEventTree = {
		// example to remember the format of publicEventTree object
		//	"2014": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//          },
		//	"2015": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//			}
	};

	self.publicEventTreeCountBasedOnEventKind = null;
	// example
	//
	//"1": {
	//	"upcoming": ko.observable(10),
	//	"old" : ko.observable(20)
	//},
	//"2": {
	//	"upcoming": ko.observable(10),
	//	"old" : ko.observable(20)
	//}

	self.myEventTreeCountBasedOnEventKind = null;
	// example
	//
	//"1": {
	//	"upcoming": ko.observable(10),
	//	"old" : ko.observable(20)
	//},
	//"2": {
	//	"upcoming": ko.observable(10),
	//	"old" : ko.observable(20)
	//}

	self.myEventTree = {
		// example to remember the format of myEventTree object
		//	"2014": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//          },
		//	"2015": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//			}
	};

	self.myNoteTree = {
		// example to remember the format of dailyNotesTree object
		//	"2014": {
		//		"8": [{ "3": [note, note] }, { "7": [note] }, { "9": [note, note, note, note] }],
		//		"9": [{ "2": [note] }]	
		//          },
		//	"2015": {
		//		"8": [{ "3": [note, note] }, { "7": [note] }, { "9": [note, note, note, note] }],
		//		"9": [{ "2": [note] }]	
		//			}
	};


	//////////////////////////////////////////////////////////
	// METHODS 
	//////////////////////////////////////////////////////////

	self.addEventOnClick = function ()
	{
		var $addEventForm = $( "#addEventForm" );
		var $addEventContainer = $( "#addNewEventContainer" );
		var privacyLvlValue = self.observableEvent.privacyLevel.value;
		var eventKindValue = self.observableEvent.kind.value();
		var $dateValidationMsg;

		var day = self.observableEvent.startDate.day();
		var month = self.observableEvent.startDate.month();
		var year = self.observableEvent.startDate.year();

		day = parseInt( day, 10 );
		month = parseInt( month, 10 );
		year = parseInt( year, 10 );

		if ( !self.validateDate( day, month, year ) )
		{
			$dateValidationMsg = $( "#addNewEventContainer #dateValidationErrorMsg" );
			$( "#addNewEventContainer .event-startdate-txtbox" ).addClass( "input-validation-error" );
			$dateValidationMsg.removeClass( "field-validation-valid" ).addClass( "field-validation-error" ).show();
			return false;
		}

		$addEventForm.validate().form();

		if ( $addEventForm.valid() )
		{
			var startHour = self.observableEvent.startDate.startHour();
			var endHour = self.observableEvent.startDate.endHour();
			var startMinute = self.observableEvent.startDate.startMinute();
			var endMinute = self.observableEvent.startDate.endMinute();

			startHour = parseInt( startHour, 10 );
			endHour = parseInt( endHour, 10 );
			startMinute = parseInt( startMinute, 10 );
			endMinute = parseInt( endMinute, 10 );

			var dateDiffAtLeast10Mins = self.validateAddEventFormDates( startHour, endHour, startMinute, endMinute );
			if ( !dateDiffAtLeast10Mins )
			{
				$( "#endHourSelectBox" ).addClass( "input-validation-error" );
				$( "#endMinuteSelectBox" ).addClass( "input-validation-error" );

				//TODO: validation message hard coded - needs to be moved to consts
				$( "#endDateValidationErrorMsg" ).text( "Wydarzenie powinno trwać przynajmniej 10 minut." ).show();

				return false;
			}

			var startEventDate = new Date( year, month - 1, day, startHour, startMinute, 0, 0 );
			var endEventDate = new Date( year, month - 1, day, endHour, endMinute, 0, 0 );

			//TODO: move this code to separate class and unit test it
			////////////
			var diff = Math.abs( startEventDate - endEventDate );
			var minutes = Math.floor(( diff / 1000 ) / 60 );
			////////////

			var startDateJson = startEventDate.toJSON();

			///////////////////////////////////////////
			//prepare parameters to call WebAPI
			///////////////////////////////////////////
			var data = $addEventForm.serialize() +
					  "&Event.StartDate=" + startDateJson +
					  "&EventStartDate.Year=" + year +
					  "&EventStartDate.Month=" + month +
					  "&EventStartDate.Day=" + day +
					  "&EventStartDate.Hour=" + startHour +
					  "&EventStartDate.Minute=" + startMinute +
					  "&EventEndDate.Year=" + year +
					  "&EventEndDate.Month=" + month +
					  "&EventEndDate.Day=" + day +
					  "&EventEndDate.Hour=" + endHour +
					  "&EventEndDate.Minute=" + endMinute +
					  "&PrivacyLevel.Value=" + privacyLvlValue +
					  "&EventKind.Value=" + eventKindValue;

			//////////////////////////////////////////////
			//call WebAPI - Add new event
			//////////////////////////////////////////////
			self.UTILS.loader.show( true );
			$addEventContainer.hide();

			var promise = self.UTILS.webApiCaller.callAddEvent( data );
			promise.then(
				  function ( result ) { success( result ); },
				  function ( result ) { error( result ); } )
		}

		function success( result )
		{
			var kkEvent, date = new Date();
			var status = { name: "Accepted", value: 1 };
			var isCurrentUserSignedUpForEvent = false, isEventAddedToCurrentUserCalendar = true;

			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( false );
				$( "#addNewEventContainer" ).show();
				alert( result.Message );
			} else
			{
				kkEvent = self.EVENT_MANAGER.getNewKKEventModel(
						self.userName,
						self.observableEvent.address.street(),
						self.observableEvent.address.city(),
						self.observableEvent.address.zipCode(),
						self.observableEvent.description(),
						self.observableEvent.details(),
						minutes,
						self.observableEvent.kind.value(),
						self.observableEvent.kind.name(),
						result.EventId,
						self.observableEvent.occupancyLimit(),
						self.observableEvent.privacyLevel.name,
						self.observableEvent.privacyLevel.value,
						new KKEventDateModel( startMinute, endMinute, startHour, endHour, day, month, year ),
						self.observableEvent.name(),
						self.observableEvent.urlLink(),
						self.observableEvent.price(),
						new KKDateModel( date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getFullYear() ),
						isEventAddedToCurrentUserCalendar,
						isCurrentUserSignedUpForEvent,
						//TODO: refactor event status code
						status
						);

				var dayEvents = self.EVENT_MANAGER.addEvent( kkEvent );

				self.setCalendarPlacementRow( dayEvents );
				self.redrawCalendarCell( dayEvents, kkEvent.startDate.year, kkEvent.startDate.month, kkEvent.startDate.day );

				self.UTILS.loader.hide( true );
			}

		};
		function error( result )
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( false );
			$addEventContainer.show();
		};
	};

	self.updateEventOnClick = function ()
	{
		var $addEventForm = $( "#addEventForm" );
		var $addEventContainer = $( "#addNewEventContainer" );
		var privacyLvlValue = self.observableEvent.privacyLevel.value;
		var eventKindValue = self.observableEvent.kind.value();
		var $dateValidationMsg;

		var day = self.observableEvent.startDate.day();
		var month = self.observableEvent.startDate.month();
		var year = self.observableEvent.startDate.year();

		day = parseInt( day, 10 );
		month = parseInt( month, 10 );
		year = parseInt( year, 10 );

		if ( !self.validateDate( day, month, year ) )
		{
			$dateValidationMsg = $( "#addNewEventContainer #dateValidationErrorMsg" );
			$( "#addNewEventContainer .event-startdate-txtbox" ).addClass( "input-validation-error" );
			$dateValidationMsg.removeClass( "field-validation-valid" ).addClass( "field-validation-error" ).show();
			return false;
		}

		$addEventForm.validate().form();

		if ( $addEventForm.valid() )
		{
			var startHour = self.observableEvent.startDate.startHour();
			var endHour = self.observableEvent.startDate.endHour();
			var startMinute = self.observableEvent.startDate.startMinute();
			var endMinute = self.observableEvent.startDate.endMinute();

			startHour = parseInt( startHour, 10 );
			endHour = parseInt( endHour, 10 );
			startMinute = parseInt( startMinute, 10 );
			endMinute = parseInt( endMinute, 10 );

			var dateDiffAtLeast10Mins = self.validateAddEventFormDates( startHour, endHour, startMinute, endMinute );
			if ( !dateDiffAtLeast10Mins )
			{
				$( "#endHourSelectBox" ).addClass( "input-validation-error" );
				$( "#endMinuteSelectBox" ).addClass( "input-validation-error" );

				//TODO: validation message hard coded - needs to be moved to consts
				$( "#endDateValidationErrorMsg" ).text( "Wydarzenie powinno trwać przynajmniej 10 minut." ).show();

				return false;
			}

			var startEventDate = new Date( year, month - 1, day, startHour, startMinute, 0, 0 );
			var endEventDate = new Date( year, month - 1, day, endHour, endMinute, 0, 0 );

			//TODO: move this code to separate class and unit test it
			////////////
			var diff = Math.abs( startEventDate - endEventDate );
			var minutes = Math.floor(( diff / 1000 ) / 60 );
			////////////

			var startDateJson = startEventDate.toJSON();

			///////////////////////////////////////////
			//prepare parameters to call WebAPI
			///////////////////////////////////////////
			var data = $addEventForm.serialize() +
					  "&Event.Id=" + self.observableEvent.id +
					  "&Event.StartDate=" + startDateJson +
					  "&EventStartDate.Year=" + year +
					  "&EventStartDate.Month=" + month +
					  "&EventStartDate.Day=" + day +
					  "&EventStartDate.Hour=" + startHour +
					  "&EventStartDate.Minute=" + startMinute +
					  "&EventEndDate.Year=" + year +
					  "&EventEndDate.Month=" + month +
					  "&EventEndDate.Day=" + day +
					  "&EventEndDate.Hour=" + endHour +
					  "&EventEndDate.Minute=" + endMinute +
					  "&PrivacyLevel.Value=" + privacyLvlValue +
					  "&EventKind.Value=" + eventKindValue;

			//////////////////////////////////////////////
			//call WebAPI - update event
			//////////////////////////////////////////////
			self.UTILS.loader.show( true );
			$addEventContainer.hide();

			var promise = self.UTILS.webApiCaller.callUpdateEvent( data );
			promise.then(
				  function ( result ) { success( result ); },
				  function ( result ) { error( result ); } )
		}

		function success( result )
		{
			var kkEvent, oldEvent;

			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( false );
				$addEventContainer.show();
				alert( result.Message );
			} else
			{
				oldEvent = self.EVENT_MANAGER.getEventByDateAndId( result.EventId, result.Year, result.Month, result.Day, self.myEventTree );
				kkEvent = self.EVENT_MANAGER.getNewKKEventModel(
						self.userName,
						self.observableEvent.address.street(),
						self.observableEvent.address.city(),
						self.observableEvent.address.zipCode(),
						self.observableEvent.description(),
						self.observableEvent.details(),
						minutes,
						self.observableEvent.kind.value(),
						self.observableEvent.kind.name(),
						result.EventId,
						self.observableEvent.occupancyLimit(),
						self.observableEvent.privacyLevel.name,
						self.observableEvent.privacyLevel.value,
						new KKEventDateModel( startMinute, endMinute, startHour, endHour, day, month, year ),
						self.observableEvent.name(),
						self.observableEvent.urlLink(),
						self.observableEvent.price(),
						oldEvent.dateAdded,
						oldEvent.isEventAddedToCurrentUserCalendar(),
						oldEvent.isCurrentUserSignedUpForEvent(),
						oldEvent.status
						);

				self.EVENT_MANAGER.removeEvent( result.EventId, result.Year, result.Month, result.Day, true );
				var dayEvents = self.EVENT_MANAGER.addEvent( kkEvent );

				self.setCalendarPlacementRow( dayEvents );
				self.redrawCalendarCell( dayEvents, kkEvent.startDate.year, kkEvent.startDate.month, kkEvent.startDate.day );

				self.UTILS.loader.hide( true );
			}
		};
		function error( result )
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( false );
			$addEventContainer.show();
		};
	}

	self.AddNoteOnClick = function ()
	{
		var promise, data;
		var text = self.observableNote.data().trim();
		if ( text == "" )
		{
			return false;
		}

		data = 'Data=' + text;
		data += '&DisplayDate.Year=' + self.detailsPageDisplayDate.year();
		data += '&DisplayDate.Month=' + self.detailsPageDisplayDate.month();
		data += '&DisplayDate.day=' + self.detailsPageDisplayDate.day();

		//////////////////////////////////////////////
		//call WebAPI - Add new note
		//////////////////////////////////////////////
		self.UTILS.loader.show( true );

		promise = self.UTILS.webApiCaller.callAddNote( data );
		promise.then(
				function ( result ) { success( result ); },
				function () { error(); } )

		function success( result )
		{
			var displayDate, kkNote, date = new Date();

			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( true );
				alert( result.Message );
			} else
			{
				displayDate = new KKDateModel( null, null, self.detailsPageDisplayDate.day(), self.detailsPageDisplayDate.month(), self.detailsPageDisplayDate.year() );

				kkNote = self.NOTE_MANAGER.getNewKKNoteModel( result.NoteId, self.observableNote.data(), self.userName, self.observableNote.privacyLevel.name,
							self.observableNote.privacyLevel.value, displayDate, false, new KKDateModel( date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getFullYear() ) );
				self.NOTE_MANAGER.addNote( kkNote );

				self.observableNote.data( "" );
				self.UTILS.loader.hide( true );
			}
		}
		function error()
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( true );
		}
	};

	self.prepareDeleteEventDetailsPageOnDeleteLinkClick = function ( id, year, month, day, privacyLevelName )
	{
		var $popup = $( "#appContainer" ).children( ".confirmation-popupbox" );

		var selectedKKEventModel = self.EVENT_MANAGER.getEventByDateAndId( id, year, month, day, self.myEventTree );

		var $yesBtn = $popup.find( ".confirmation-popupbox-yesbtn" );
		$yesBtn.attr( "data-bind", "click: function () { $root.deleteEventDetailsPageOnConfirmationYesBtnClick($element, " + id + "," + year + "," + month + "," + day + ")}" );

		self.showConfirmationPopupBox( $popup, "Czy napewno chcesz usunąć wskazane wydarzenie?" );

		ko.unapplyBindings( $yesBtn[0] );
		ko.applyBindings( self, $yesBtn[0] );
	};

	self.prepareDeleteNoteDetailsPageOnDeleteLinkClick = function ( id, year, month, day )
	{
		var $popup = $( "#appContainer" ).children( ".confirmation-popupbox" );
		var $yesBtn = $popup.find( ".confirmation-popupbox-yesbtn" );
		$yesBtn.attr( "data-bind", "click: function () { $root.deleteNoteDetailsPageOnConfirmationYesBtnClick($element, " + id + "," + year + "," + month + "," + day + ")}" );

		self.showConfirmationPopupBox( $popup, "Czy napewno chcesz usunąć wskazaną notatke?" );

		ko.unapplyBindings( $yesBtn[0] );
		ko.applyBindings( self, $yesBtn[0] );
	};

	self.deleteEventDetailsPageOnConfirmationYesBtnClick = function ( element, id, year, month, day )
	{
		//////////////////////////////////////////////
		//call WebAPI - Delete event with given id
		//////////////////////////////////////////////
		self.hideConfirmationPopupBox( element );
		self.UTILS.loader.show( true );

		var promise = self.UTILS.webApiCaller.callDeleteEvent( id );
		promise.then(
				function ( result ) { success( result ); },
				function () { error(); } )

		function success( result )
		{
			var $container, events, $tableBody, h, offset, $detailsDayTable;
			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( true );
				//TODO: change alert to some error popop or error page...
				alert( result.Message );
			} else
			{
				self.UTILS.loader.hide( true );
				$container = $( "#details .event-block-container[data-eventid='" + id + "']" );
				$container.fadeOut( 500, function ()
				{
					$container.remove();
					self.EVENT_MANAGER.removeEvent( id, year, month, day, false );

					//redraw details page event rectangle table
					self.removeEventRectanglesFromDetailsDay();
					events = self.detailsPageDayEvents();

					self.setCalendarPlacementRow( events );
					self.detailsPageEventMostBottomRow = 1;
					self.redrawCalendarCell( events, year, month, day );

					for ( var i in events )
					{
						self.drawEventToDetailsDayTable( events[i] );
					}

					$detailsDayTable = $( "#details #detailsDayTable" );
					self.resizeDetailsDayTable( self.detailsPageEventMostBottomRow );
					offset = $detailsDayTable.position().top - 83;
					$detailsDayTable.scrollTo( 500, offset );
				} );
			}

		}
		function error()
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( true );
		}
	};

	self.deleteNoteDetailsPageOnConfirmationYesBtnClick = function ( element, id, year, month, day )
	{
		var promise;

		//////////////////////////////////////////////
		//call WebAPI - Delete note with given id
		//////////////////////////////////////////////
		self.hideConfirmationPopupBox( element );
		self.UTILS.loader.show( true );

		promise = self.UTILS.webApiCaller.callDeleteNote( id );
		promise.then(
				function ( result ) { success( result ); },
				function () { error(); } )

		function success( result )
		{
			var $container;
			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( true );
				//TODO: change alert to some error popop or error page...
				alert( result.Message );
			} else
			{
				self.UTILS.loader.hide( true );
				$container = $( "#notesList li[data-noteid='" + id + "']" );
				$container.fadeOut( 500, function ()
				{
					$container.remove();
					self.NOTE_MANAGER.removeNote( id, year, month, day );
				} );
			}
		}
		function error()
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( true );
			self.hideConfirmationPopupBox( element );
		}
	};

	self.editEventDetailsPageOnEditLinkClick = function ( id, year, month, day )
	{
		var $details = $( "#details" );

		self.UTILS.loader.$overlay.show();

		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.find( ".popupbox-header-title" ).text( "Edycja wydarzenia" );

		var $addBtn = $addEventContainer.find( "#btnAddNewEvent" );
		$addBtn.attr( "data-bind", "click: $root.updateEventOnClick" )
		$addBtn.text( "Zapisz zmiany" );

		$addEventContainer.fadeIn();

		ko.unapplyBindings( $addBtn[0] );
		ko.applyBindings( self, $addBtn[0] );

		var event = self.EVENT_MANAGER.getEventByDateAndId( id, year, month, day, self.myEventTree );

		//TODO: create Factory Method to fillout observebleEvent

		self.observableEvent.name( event.name );

		self.observableEvent.addedBy( event.addedBy );

		self.observableEvent.address.street( event.address.street );
		self.observableEvent.address.city( event.address.city );
		self.observableEvent.address.zipCode( event.address.zipCode );

		self.observableEvent.dateAdded = event.dateAdded;

		self.observableEvent.description( event.description );
		self.observableEvent.details( event.details );
		self.observableEvent.eventLengthInMinutes = event.eventLengthInMinutes;

		self.observableEvent.kind.value( event.kind.value );
		self.observableEvent.kind.name( event.kind.name );
		self.observableEvent.kind.color = self.UTILS.colorHelper.getEventColor( event.privacyLevel.value, self.observableEvent.kind.value );
		self.observableEvent.kind.headerColor = self.UTILS.colorHelper.getEventBoxHeaderColor( self.observableEvent.kind.value );
		self.observableEvent.kind.detailsPageEventBorderColor = self.UTILS.colorHelper.getEventDetailsBorderColor( self.observableEvent.kind.value );

		self.observableEvent.id = event.id;

		self.observableEvent.occupancyLimit( event.occupancyLimit );

		self.observableEvent.privacyLevel.name = event.privacyLevel.name;
		self.observableEvent.privacyLevel.value = event.privacyLevel.value;

		self.observableEvent.urlLink( event.urlLink );
		self.observableEvent.price( event.price );

		self.observableEvent.startDate.startMinute( event.startDate.startMinute );
		self.observableEvent.startDate.startHour( event.startDate.startHour );
		self.observableEvent.startDate.endMinute( event.startDate.endMinute );
		self.observableEvent.startDate.endHour( event.startDate.endHour );
		self.observableEvent.startDate.day( event.startDate.formatZero( event.startDate.day ) );
		self.observableEvent.startDate.month( event.startDate.formatZero( event.startDate.month ) );
		self.observableEvent.startDate.year( event.startDate.formatZero( event.startDate.year ) );

		//var docScroll = $("#slide-item-details").parent().scrollTop();
		//$addEventContainer.css("top", docScroll + 30);
		//$addEventContainer.show();
		$addEventContainer.find( "#Event_Title" ).focus();
	};

	self.editNoteDetailsPageOnEditLinkClick = function ( id, year, month, day )
	{
		var $editContainer = $( "<div class='edit-mode-note-container'></div>" );
		var $btns = $( "<div style='text-align:center;font-size:18px;'><span class='green-color hover-cursor-pointer' style='padding:4px;'  data-bind='click:$root.updateNoteDetailsPageOnSaveLinkClick.bind($root," + id + ',' + year + ',' + month + ',' + day + ")'>zapisz</span><span class='red-color hover-cursor-pointer' style='padding:4px;' data-bind='click:$root.cancelEditNoteDetailsPageOnCancelLinkClick.bind($root," + id + ")'>anuluj</span></div>" );
		var cancelLink = $btns.find( ".red-color" )[0];
		var saveLink = $btns.find( ".green-color" )[0];

		ko.unapplyBindings( cancelLink );
		ko.unapplyBindings( saveLink );
		ko.applyBindings( self, cancelLink );
		ko.applyBindings( self, saveLink );

		var $textbox = $( "<textarea style='width: 100%;vertical-align: top;margin-top: 10px;box-sizing: border-box;border: 1px solid #EBEBD9;resize: none;outline: none;padding: 10px;background: #F2F2E5;'/>" );
		var $container = $( "#notesListContainer li[data-noteid='" + id + "']" );
		var noteText = $container.find( "pre" ).text();
		$container.find( ".note-content" ).hide();
		$textbox.val( noteText );
		$editContainer.append( $textbox ).append( $btns );
		$container.append( $editContainer ).find( "textarea" ).focus();
	};

	self.updateNoteDetailsPageOnSaveLinkClick = function ( id, year, month, day )
	{
		var $container = $( "#notesListContainer li[data-noteid='" + id + "']" );
		var text = $container.find( "textarea" ).val().trim();
		var promise, note, data;

		if ( text == "" )
		{
			return false;
		}

		note = self.NOTE_MANAGER.getNoteByDateAndId( id, year, month, day );

		if ( !note )
		{
			return false;
		}

		data = 'Data=' + text + '&Id=' + id + '&IsLineThrough=' + !note.isLineThrough;

		//////////////////////////////////////////////
		//call WebAPI - Update note with given id
		//////////////////////////////////////////////
		self.UTILS.loader.show( true );

		var promise = self.UTILS.webApiCaller.callUpdateNote( data );
		promise.then(
					function ( result ) { success( result ); },
					function () { error(); } )

		function success( result )
		{
			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( true );
				alert( result.Message );
			} else
			{
				note.data = text;
				$container.find( "pre" ).text( text );
				$container.find( ".edit-mode-note-container" ).remove();
				$container.find( ".note-content" ).show();
				self.UTILS.loader.hide( true );
			}
		}
		function error()
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( true );
		}
	};

	self.setLineThroughNoteDetailsPageOnLineThroughLinkClick = function ( id, year, month, day, isLineThrough )
	{
		var $container = $( "#notesListContainer li[data-noteid='" + id + "']" );
		var text, promise;

		var note = self.NOTE_MANAGER.getNoteByDateAndId( id, self.detailsPageDisplayDate.year(), self.detailsPageDisplayDate.month(), self.detailsPageDisplayDate.day() );

		if ( !note )
		{
			return false;
		}

		text = note.data;

		var data = 'Data=' + text + '&Id=' + id + '&IsLineThrough=' + isLineThrough;

		//////////////////////////////////////////////
		//call WebAPI - setLineThrough note with given id
		//////////////////////////////////////////////
		self.UTILS.loader.show( true );

		promise = self.UTILS.webApiCaller.callSetLineThroughNote( data );
		promise.then(
					function ( result ) { success( result ); },
					function () { error(); } )

		function success( result )
		{
			var isLineThrough;

			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( true );
				alert( result.Message );
			} else
			{
				isLineThrough = !note.isLineThrough();
				self.UTILS.loader.hide( true );
				note.isLineThrough( isLineThrough );
			}
		}
		function error()
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( true );
		}
	};

	self.cancelEditNoteDetailsPageOnCancelLinkClick = function ( id )
	{
		var $container = $( "#notesListContainer li[data-noteid='" + id + "']" );
		$container.find( ".edit-mode-note-container" ).remove();
		$container.find( ".note-content" ).show();
	};

	self.redrawCalendarCell = function ( dayEvents, year, month, day )
	{
		var monthClass;
		var calendarYear = self.calendarPageDisplayDate.year(), calendarMonth = self.calendarPageDisplayDate.month();

		if ( year === calendarYear )
		{
			if ( month === calendarMonth )
			{
				monthClass = ".day" + day;
			}
			else if ( month === ( calendarMonth - 1 || calendarMonth + 1 ) )
			{
				monthClass = ".other-month-day" + day;
			}
		}
		else if ( ( year === ( calendarYear - 1 ) && month == 12 ) || ( year === ( calendarYear + 1 ) && month == 1 ) )
		{
			monthClass = ".other-month-day" + day;
		}

		removeEventRectangle( monthClass );

		for ( var i = 0; i < dayEvents.length; i++ )
		{
			self.drawEventToCalendar( dayEvents[i] );
		}

		function removeEventRectangle( cssClass )
		{
			var cellDay = cssClass;
			var $cellPlaceholder = $( "#calendar" ).find( cellDay ).find( ".calendar-cell-placeholder" );
			var $eventsToRemove = $cellPlaceholder.find( ".event-rectangle" );
			$eventsToRemove.remove();
		}
	}

	self.showConfirmationPopupBox = function ( $popup, txt )
	{
		$popup.find( ".confirmation-popupbox-maintext" ).text( txt );
		$( "#appContainer" ).children( ".page-overlay" ).show();
		$popup.show();
	};

	self.hideConfirmationPopupBox = function ( element )
	{
		var $btn = $( element );
		var $popup = $btn.closest( ".confirmation-popupbox" );
		var $yesBtn = $popup.find( ".confirmation-popupbox-yesbtn" );
		$yesBtn.attr( "data-bind", '' );

		$popup.siblings( ".page-overlay" ).hide();
		$popup.hide();

	};

	self.showSelectedJournalMenuItem = function ( menuItemIndex )
	{
		if ( self.detailsPageJournalMenu.selectedMenuItem() === menuItemIndex )
		{
			return false;
		}

		var prop = self.detailsPageJournalMenu.getCurrentSelectedEventsProp();
		prop.old( [] );
		prop.upcoming( [] );

		self.detailsPageJournalMenu.selectedMenuItem( menuItemIndex );
		self.showSelectedEvents( self.detailsPageJournalMenu.getCurrentSelectedEventsProp(), 'all', self.detailsPageJournalMenu.selectedEventKindValues );

		if ( !self.detailsPageJournalMenu.isOpen() )
		{
			//self.hideDetailsPageClockContainer()
			self.detailsPageJournalMenu.isOpen( true );
		}
	};

	self.showMoreOptionsInAddNewEventPopupOnClick = function ( element )
	{
		var $element = $( element );
		var $moreOptionsContainer = $( "#addNewEventContainer .more-options-container" );

		if ( !$element.hasClass( "visible" ) )
		{
			$element.text( "Ukryj dodatkowe opcje -" );
			$moreOptionsContainer.slideDown();
		} else
		{
			$element.text( "Pokaż więcej opcji +" );
			$moreOptionsContainer.slideUp();
		}

		$element.toggleClass( "visible" );

	}

	self.showEventDetailsOnEventBlockClick = function ( block )
	{
		$( block ).closest( ".event-block-container" ).scrollTo( 500 );
	};

	self.showTodayInDetailsPageCalendarDetailsTable = function ()
	{
		self.detailsPageEventMostBottomRow = 1;

		self.detailsPageDisplayDate.day( self.todayDate.day );
		self.detailsPageDisplayDate.month( self.todayDate.month );
		self.detailsPageDisplayDate.year( self.todayDate.year );

		//Events
		var events = self.EVENT_MANAGER.getEventsForGivenDay( self.todayDate.year, self.todayDate.month, self.todayDate.day, self.myEventTree )
		self.detailsPageDayEvents( events );

		//Notes
		var notes = self.NOTE_MANAGER.getNotesForGivenDay( self.todayDate.year, self.todayDate.month, self.todayDate.day )
		self.detailsPageDayNotes( notes );

		self.removeEventRectanglesFromDetailsDay();

		//Draw to detailsDayTable
		for ( var i in events )
		{
			self.drawEventToDetailsDayTable( events[i] );
		}

		self.resizeDetailsDayTable( self.detailsPageEventMostBottomRow );

		var $detailsDayTable = $( "#details #detailsDayTable" );
		var offset = $detailsDayTable.position().top - 83;

		$detailsDayTable.scrollTo( 500, offset );
	}

	self.changeEventCountTreeValueBasedOnEventKind = function ( countTree, event, value )
	{
		var old, upcoming, today, endDate;
		var eventTreeCountNode = countTree[event.kind.value];

		//TODO: is eventTreeCountNode always true?
		if ( eventTreeCountNode )
		{
			old = eventTreeCountNode.old();
			upcoming = eventTreeCountNode.upcoming();

			today = new Date();
			endDate = new Date( event.startDate.year, event.startDate.month - 1, event.startDate.day, event.startDate.endHour, event.startDate.endMinute, 0, 0 );

			if ( today > endDate )
			{
				eventTreeCountNode.old( old + value );
			} else
			{
				eventTreeCountNode.upcoming( upcoming + value );
			}
		}
	}

	self.drawEventToCalendar = function ( event )
	{
		var cellDay, $cell, $cellPlaceholder;

		if ( event.startDate.year == self.calendarPageDisplayDate.year() )
		{
			if ( event.startDate.month === self.calendarPageDisplayDate.month() )
			{
				cellDay = ".day" + parseInt( event.startDate.day, 10 );
			}
			else if ( event.startDate.month < self.calendarPageDisplayDate.month() )
			{
				cellDay = ".prev-month-cell.other-month-day" + parseInt( event.startDate.day, 10 );
			}
			else if ( event.startDate.month > self.calendarPageDisplayDate.month() )
			{
				cellDay = ".next-month-cell.other-month-day" + parseInt( event.startDate.day, 10 );
			}
		}
		else if ( event.startDate.year > self.calendarPageDisplayDate.year() )
		{
			cellDay = ".next-month-cell.other-month-day" + parseInt( event.startDate.day, 10 );
		}
		else if ( event.startDate.year < self.calendarPageDisplayDate.year() )
		{
			cellDay = ".prev-month-cell.other-month-day" + parseInt( event.startDate.day, 10 );
		}

		$cell = $( "#calendar" ).find( cellDay );
		$cellPlaceholder = $cell.find( ".calendar-cell-placeholder" );

		if ( $cellPlaceholder.length == 0 )
		{
			return false;
		}

		//TODO: using const here, better to calculate it 
		var percentWidthBetweenLines = 6.8;
		var minutePercentage = 6.8 / 60;

		var cellLineStart = ".cell-line" + event.startDate.startHour;
		var cellLineEnd = ".cell-line" + event.startDate.endHour;
		var $cellLineStart = $cellPlaceholder.find( cellLineStart );

		var hourOffset = parseFloat( $cellLineStart[0].style.left );

		var left = hourOffset + ( event.startDate.startMinute * minutePercentage );
		var width = minutePercentage * event.eventLengthInMinutes;

		var addressStreetStr = event.address.street ? event.address.street : "";
		var addressCityStr = event.address.city ? ", " + event.address.city : "";
		var addressStr = addressStreetStr + addressCityStr;

		var name = event.privacyLevel.value == self.eventPrivacyLevels["private"] ? event.name : ( "*** " + event.name );

		var weekday = $cell.data( "weekday" );

		var $event = $( '<div class="event-rectangle" style="top:' + ( event.calendarPlacementRow - 1 ) * 28 + 'px; left:' +
			left + '%; width:' + width + '%;border-color:' + event.kind.color +
			';" data-name="' + name +
			'" data-address="' + addressStr +
			'" data-starthour="' + event.startDate.startHour +
			'" data-endhour="' + event.startDate.endHour +
			'" data-startminute="' + event.startDate.startMinute +
			'" data-endminute="' + event.startDate.endMinute +
			'" data-weekday="' + weekday + '">' + name +
			'</div>' );

		$cellPlaceholder.append( $event );
	};

	self.drawEventToDetailsDayTable = function ( event, onAppInit )
	{
		//TODO: inject self.detailsPageEventMostBottomRow into the method

		//set detailsPageBottomRow to calculate detailsPageEventsTable height based on the most bottom event.calendarPlacementRow 
		if ( event.calendarPlacementRow > self.detailsPageEventMostBottomRow )
		{
			self.detailsPageEventMostBottomRow = event.calendarPlacementRow;
		}

		var startMinuteOffset = event.startDate.startMinute / 60 * 100;
		var endMinuteOffset = event.startDate.endMinute / 60 * 100;
		var width = ( ( event.startDate.endHour - event.startDate.startHour ) * 100 ) - startMinuteOffset + endMinuteOffset;

		var $hourCell = $( ".hour-cell-" + event.startDate.startHour );
		var name = event.privacyLevel.value == 1 ? event.name : "*** " + event.name;
		var eventRectangle = '<div data-bind="click: function(){ $root.showEventBlockInfoOnDetailsPageEventRectangleClick(' + event.id + ') }" class="event-rectangle-details" style="width:' + ( width - 2 ) + '%;top : ' + ( ( ( event.calendarPlacementRow - 1 ) * 46 ) + 12 ) + 'px;left:' + ( startMinuteOffset + 1 ) + '%;border-color:' + event.kind.detailsPageEventBorderColor + ';"><span>' + name + '</span></div>';
		var $eventRectangle = $( eventRectangle );

		$eventRectangle.appendTo( $hourCell );
		$eventRectangle.parent();

		ko.unapplyBindings( $eventRectangle[0] );
		ko.applyBindings( self, $eventRectangle[0] );
	};

	self.removeEventRectanglesFromDetailsDay = function ()
	{
		$( "#details #detailsDayTable .event-rectangle-details" ).remove();
		self.detailsPageEventMostBottomRow = 1;
	};

	self.moveToDetailsPageOnCalendarCellClick = function ( element )
	{
		self.detailsPageEventMostBottomRow = 1;
		var day = $( element ).data( "daynumber" );
		var dayInt = parseInt( day, 10 );
		self.detailsPageDisplayDate.day( dayInt );

		var $cell = $( element ).closest( ".calendar-cell" );

		if ( $cell.hasClass( "prev-month-cell" ) )
		{
			if ( self.calendarPageDisplayDate.month() == 1 )
			{
				self.detailsPageDisplayDate.year( self.calendarPageDisplayDate.year() - 1 );
				self.detailsPageDisplayDate.month( 12 );
			} else
			{
				self.detailsPageDisplayDate.year( self.calendarPageDisplayDate.year() );
				self.detailsPageDisplayDate.month( self.calendarPageDisplayDate.month() - 1 );
			}

		} else if ( $cell.hasClass( "next-month-cell" ) )
		{
			if ( self.calendarPageDisplayDate.month() == 12 )
			{
				self.detailsPageDisplayDate.year( self.calendarPageDisplayDate.year() + 1 );
				self.detailsPageDisplayDate.month( 1 );
			} else
			{
				self.detailsPageDisplayDate.year( self.calendarPageDisplayDate.year() )
				self.detailsPageDisplayDate.month( self.calendarPageDisplayDate.month() + 1 );
			}
		}
		else
		{
			self.detailsPageDisplayDate.year( self.calendarPageDisplayDate.year() );
			self.detailsPageDisplayDate.month( self.calendarPageDisplayDate.month() );
		}

		var notes = self.NOTE_MANAGER.getNotesForGivenDay( self.detailsPageDisplayDate.year(), self.detailsPageDisplayDate.month(), self.detailsPageDisplayDate.day() )
		self.detailsPageDayNotes( notes );

		var events = self.EVENT_MANAGER.getEventsForGivenDay( self.detailsPageDisplayDate.year(), self.detailsPageDisplayDate.month(), self.detailsPageDisplayDate.day(), self.myEventTree )
		self.detailsPageDayEvents( events );

		self.removeEventRectanglesFromDetailsDay();

		for ( var i in events )
		{
			self.drawEventToDetailsDayTable( events[i] );
		}

		self.resizeDetailsDayTable( self.detailsPageEventMostBottomRow )

		var $scrollable = $( "#slide-item-details" ).parent();

		window.location = "#2";

		setTimeout( function ()
		{
			$( "#details #calendarDayDetailsContainer" ).scrollTo( 1000, 50 );

		}, 10 )
	};

	self.resizeDetailsDayTable = function ( detailsPageEventMostBottomRow )
	{
		var $tableBody = $( "#details .details-day-table-body" );
		var h = ( detailsPageEventMostBottomRow * 46 ) + 20;
		$tableBody.height( h + "px" );
	}

	self.addPublicEventToMyCalendarOnClick = function ( element, id, year, month, day )
	{
		var data = 'Username=' + self.userName + '&EventId=' + id;
		var promise;

		//////////////////////////////////////////////
		//call WebAPI - add existing event to user
		//////////////////////////////////////////////
		self.UTILS.loader.show( true );

		promise = self.UTILS.webApiCaller.callAddExistingEventToUser( data );
		promise.then(
				function ( result ) { success( result ); },
				function () { error(); } )

		function success( result )
		{
			var displayDate, kkEvent, dayEvents;

			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( true );
				alert( result.Message );
			} else
			{
				kkEvent = self.EVENT_MANAGER.getEventByDateAndId( id, year, month, day, self.publicEventTree );
				kkEvent.isEventAddedToCurrentUserCalendar( true );

				dayEvents = self.EVENT_MANAGER.addEvent( kkEvent );

				self.setCalendarPlacementRow( dayEvents );
				self.redrawCalendarCell( dayEvents, kkEvent.startDate.year, kkEvent.startDate.month, kkEvent.startDate.day );

				self.UTILS.loader.hide( true );
			}
		}
		function error()
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( true );
		}
	}

	self.signUpUserForEventOnClick = function ( element, id, year, month, day )
	{
		var data = 'Username=' + self.userName + '&EventId=' + id;
		var promise;

		//////////////////////////////////////////////
		//call WebAPI - sign up user for event
		//////////////////////////////////////////////
		self.UTILS.loader.show( true );

		promise = self.UTILS.webApiCaller.callSignUpUserForEvent( data );
		promise.then(
				function ( result ) { success( result ); },
				function () { error(); } )

		function success( result )
		{
			var dayEvents, kkEvent;

			if ( result.IsSuccess === false )
			{
				self.UTILS.loader.hide( true );
				alert( result.Message );
			} else
			{
				kkEvent = self.EVENT_MANAGER.getEventByDateAndId( id, year, month, day, self.publicEventTree );
				kkEvent.signedUpUsersForEvent.push( self.userName );
				kkEvent.isCurrentUserSignedUpForEvent( true );

				if ( !kkEvent.isEventAddedToCurrentUserCalendar() )
				{
					kkEvent.isEventAddedToCurrentUserCalendar( true );
					dayEvents = self.EVENT_MANAGER.addEvent( kkEvent );

					self.setCalendarPlacementRow( dayEvents );
					self.redrawCalendarCell( dayEvents, kkEvent.startDate.year, kkEvent.startDate.month, kkEvent.startDate.day );
				}

				self.UTILS.loader.hide( true );
			}

		}
		function error()
		{
			alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
			self.UTILS.loader.hide( true );
		}
	}

	self.showSelectedEventsOnMenuItemClick = function ( element, eventKindValue, selectedEventsProp, menuObj )
	{
		var $menuItemContainer = $( element );
		var $menuItem = $menuItemContainer.find( ".menu-item" );

		$menuItemContainer.toggleClass( "selected" );

		if ( $menuItemContainer.hasClass( "selected" ) )
		{
			$menuItemContainer.css( "top", "20px" );
			menuObj.selectedEventKindValues.push( eventKindValue );
			self.showSelectedEvents( selectedEventsProp, 'all', [eventKindValue] );

		} else
		{
			$menuItemContainer.css( "top", "0px" );
			menuObj.selectedEventKindValues = menuObj.selectedEventKindValues.filter( function ( e ) { return e !== eventKindValue } );
			self.removeSelectedEvents( selectedEventsProp, eventKindValue );
		}

		$menuItemContainer.scrollTo( 500, 20 );
	};

	self.showSelectedEvents = function ( selectedEventsProp, oldOrUpcoming, valuesArr )
	{
		var checkArgs;

		// details page
		if ( self.currentPage() == 2 )
		{
			if ( !self.detailsPageJournalMenu.isOpen() )
			{
				//self.hideDetailsPageClockContainer();
				self.detailsPageJournalMenu.isOpen( true );
			}

			switch ( self.detailsPageJournalMenu.selectedMenuItem() )
			{
				case 1:
					// parameter for simpleFilt.checkIf() method
					checkArgs = function ( actualObj )
					{
						return [{ "prop": actualObj.kind.value, "values": valuesArr }]
					}

					//////////////////////////////////////////////////////////
					//old
					//////////////////////////////////////////////////////////
					if ( ( oldOrUpcoming == 'old' || oldOrUpcoming == 'all' ) )
					{
						if ( self.detailsPageJournalMenu.menuItems.myCalendar.showOld() )
						{
							show( 'old', selectedEventsProp.old, checkArgs, self.myEventTree );
						} else
						{
							selectedEventsProp.old( [] );
						}
					}

					//////////////////////////////////////////////////////////
					//upcoming
					//////////////////////////////////////////////////////////
					if ( ( oldOrUpcoming == 'upcoming' || oldOrUpcoming == 'all' ) )
					{
						if ( self.detailsPageJournalMenu.menuItems.myCalendar.showUpcoming() )
						{
							show( 'upcoming', selectedEventsProp.upcoming, checkArgs, self.myEventTree );
						} else
						{
							selectedEventsProp.upcoming( [] );
						}
					}
					break;
				case 2:
					// parameter for checkIf method
					checkArgs = function ( actualObj, username )
					{
						return [{ "prop": actualObj.kind.value, "values": valuesArr }, { "boolSpecifier": 'and', "prop": actualObj.addedBy, "values": [username] }]
					}
					//////////////////////////////////////////////////////////
					//old
					//////////////////////////////////////////////////////////
					if ( ( oldOrUpcoming == 'old' || oldOrUpcoming == 'all' ) )
					{
						if ( self.detailsPageJournalMenu.menuItems.manageOwnPublicEvents.showOld() )
						{
							show( 'old', selectedEventsProp.old, checkArgs, self.publicEventTree );
						} else
						{
							selectedEventsProp.old( [] );
						}
					}

					//////////////////////////////////////////////////////////
					//upcoming
					//////////////////////////////////////////////////////////
					if ( ( oldOrUpcoming == 'upcoming' || oldOrUpcoming == 'all' ) )
					{
						if ( self.detailsPageJournalMenu.menuItems.manageOwnPublicEvents.showUpcoming() )
						{
							show( 'upcoming', selectedEventsProp.upcoming, checkArgs, self.publicEventTree );
						} else
						{
							selectedEventsProp.upcoming( [] );
						}
					}
					break;
				default:
					return;
			}

		}
			// lobby page
		else
		{
			if ( !self.lobbyPage.upcomingEventsPart.eventListMenuVM.isOpen() )
			{
				self.lobbyPage.upcomingEventsPart.eventListMenuVM.isOpen( true );
			}

			// parameter for simpleFilt.checkIf() method
			checkArgs = function ( actualObj )
			{
				return [{ "prop": actualObj.kind.value, "values": valuesArr }]
			}

			//////////////////////////////////////////////////////////
			//old
			//////////////////////////////////////////////////////////
			if ( ( oldOrUpcoming == 'old' || oldOrUpcoming == 'all' ) )
			{
				if ( self.lobbyPage.upcomingEventsPart.eventListMenuVM.menuItems.publicEvents.showOld() )
				{
					show( 'old', selectedEventsProp.old, checkArgs, self.publicEventTree );
				} else
				{
					selectedEventsProp.old( [] );
				}
			}

			//////////////////////////////////////////////////////////
			//upcoming
			//////////////////////////////////////////////////////////
			if ( ( oldOrUpcoming == 'upcoming' || oldOrUpcoming == 'all' ) )
			{
				if ( self.lobbyPage.upcomingEventsPart.eventListMenuVM.menuItems.publicEvents.showUpcoming() )
				{
					show( 'upcoming', selectedEventsProp.upcoming, checkArgs, self.publicEventTree );
				} else
				{
					selectedEventsProp.upcoming( [] );
				}
			}
		}

		function show( oldOrUpcomingFlag, selectedEventsProp, checkArgs, eventTree )
		{
			var shownEvents, combinedArray;
			var arr = self.EVENT_MANAGER.getEventsByPropertyValue( eventTree, checkArgs, oldOrUpcomingFlag );
			shownEvents = selectedEventsProp();

			if ( shownEvents.length )
			{
				combinedArray = arr.concat( shownEvents );

				//TODO: instead of concating arrays and then sorting, insert each new event at correct index;
				combinedArray.sort( function ( a, b )
				{
					return ( a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate );
				} );

				selectedEventsProp( combinedArray );
			} else
			{
				selectedEventsProp( arr );
			}
		}
	}

	self.removeSelectedEvents = function ( selectedEvents, eventKindValue )
	{
		var array;

		switch ( self.currentPage() )
		{
			case 0:
				//////////////////////////////////////////////////////////
				//old
				//////////////////////////////////////////////////////////
				if ( self.lobbyPage.upcomingEventsPart.eventListMenuVM.menuItems.publicEvents.showOld() )
				{
					array = ko.utils.arrayFilter( selectedEvents.old(), function ( item )
					{
						return item.kind.value != eventKindValue;
					} );

					selectedEvents.old( array );
				}

				//////////////////////////////////////////////////////////
				//upcoming
				//////////////////////////////////////////////////////////
				if ( self.lobbyPage.upcomingEventsPart.eventListMenuVM.menuItems.publicEvents.showUpcoming() )
				{
					array = ko.utils.arrayFilter( selectedEvents.upcoming(), function ( item )
					{
						return item.kind.value != eventKindValue;
					} );

					selectedEvents.upcoming( array );
				}

				if ( !$( "#lobby .menu-item-container" ).hasClass( "selected" ) )
				{
					self.lobbyPage.upcomingEventsPart.eventListMenuVM.isOpen( false );
				}

				break;
			case 2:
				switch ( self.detailsPageJournalMenu.selectedMenuItem() )
				{
					case 1:
						//////////////////////////////////////////////////////////
						//old
						//////////////////////////////////////////////////////////
						if ( self.detailsPageJournalMenu.menuItems.myCalendar.showOld() )
						{
							array = ko.utils.arrayFilter( selectedEvents.old(), function ( item )
							{
								return item.kind.value !== eventKindValue;
							} );

							selectedEvents.old( array );
						}

						//////////////////////////////////////////////////////////
						//upcoming
						//////////////////////////////////////////////////////////
						if ( self.detailsPageJournalMenu.menuItems.myCalendar.showUpcoming() )
						{
							array = ko.utils.arrayFilter( selectedEvents.upcoming(), function ( item )
							{
								return item.kind.value != eventKindValue;
							} );

							selectedEvents.upcoming( array );
						}
						break;
					case 2:
						//////////////////////////////////////////////////////////
						//old
						//////////////////////////////////////////////////////////
						if ( self.detailsPageJournalMenu.menuItems.manageOwnPublicEvents.showOld() )
						{
							array = ko.utils.arrayFilter( selectedEvents.old(), function ( item )
							{
								return item.kind.value !== eventKindValue;
							} );

							selectedEvents.old( array );
						}

						//////////////////////////////////////////////////////////
						//upcoming
						//////////////////////////////////////////////////////////
						if ( self.detailsPageJournalMenu.menuItems.manageOwnPublicEvents.showUpcoming() )
						{
							array = ko.utils.arrayFilter( selectedEvents.upcoming(), function ( item )
							{
								return item.kind.value != eventKindValue;
							} );

							selectedEvents.upcoming( array );
						}
						break;
					default:
						return;
				}

				if ( !$( "#details .menu-item-container" ).hasClass( "selected" ) )
				{
					self.detailsPageJournalMenu.isOpen( false );
					self.showDetailsPageClockContainer();
					self.detailsPageJournalMenu.selectedMenuItem( 1 );
				}

				break;
			default:
				return;
		}
	}

	self.moveToDetailsDayOnEventCalendarIconClick = function ( id, year, month, day )
	{
		self.detailsPageEventMostBottomRow = 1;

		self.detailsPageDisplayDate.day( day );
		self.detailsPageDisplayDate.year( year );
		self.detailsPageDisplayDate.month( month );

		var notes = self.NOTE_MANAGER.getNotesForGivenDay( year, month, day )
		self.detailsPageDayNotes( notes );

		var events = self.EVENT_MANAGER.getEventsForGivenDay( year, month, day, self.myEventTree )
		self.detailsPageDayEvents( events );

		self.removeEventRectanglesFromDetailsDay();

		for ( var i in events )
		{
			self.drawEventToDetailsDayTable( events[i] );
		}

		self.resizeDetailsDayTable( self.detailsPageEventMostBottomRow );

		var speed = 800;
		if ( self.currentPage() == 0 )
		{
			window.location = "#2";
			speed = 100;
		}

		setTimeout( function ()
		{
			$( "#details .event-block-container[data-eventid='" + id + "']" ).scrollTo( speed );
		}, 10 )
	};

	self.expandUpdateProfileForm = function ( element )
	{
		var $cont = $( "#details #updateProfileContainer" );
		$cont.find( "ol" ).slideDown();

		$cont.find( "#updateUserFormBtn" ).show();

		$( element ).hide();
		$cont.find( "#hideBtnUpdateProfile" ).show();
	}

	self.hideUpdateProfileForm = function ( element )
	{
		var $cont = $( "#details #updateProfileContainer" );
		$cont.find( "#updateUserFormBtn" ).hide();
		$cont.find( "ol" ).slideUp();

		$( element ).hide();
		$cont.find( "#expandBtnUpdateProfile" ).show();

	}

	self.closeAddNewEventPopupOnClick = function ()
	{
		var $cont = $( "#addNewEventContainer" );
		$( "#appContainer" ).children( ".page-overlay" ).hide();
		$cont.hide();
		$cont.css( "top", 30 );
		//TODO:add scroll to top 
	};

	self.showRegisterFormOnClick = function ()
	{
		var $loginForm = $( "#loginPageContainer" );
		var $registerForm = $( "#registerPageContainer" );
		$loginForm.hide();
		$registerForm.fadeIn();
		$( "#RegisterModel_UserName" ).focus();
		window.location = "/#0";

		setTimeout( function ()
		{
			$registerForm.scrollTo( 1000, 40 );
		}, 10 );

	};

	self.showLoginFormOnClick = function ()
	{
		var $loginForm = $( "#loginPageContainer" );
		var $registerForm = $( "#registerPageContainer" );
		var $loginBtn = $loginForm.find( "#loginFormBtn" );
		var $username = $loginForm.find( "#UserName" );

		$registerForm.hide();
		$loginForm.fadeIn();

		if ( $username.val() !== '' )
		{
			$loginBtn.focus();
		} else
		{
			$username.focus();
		}

		window.location = "/#0";

		setTimeout( function ()
		{
			$loginForm.scrollTo( 1000, 40 );
		}, 10 );
	};

	self.loginUserOnClick = function ()
	{
		var $loginForm = $( "#lobby #loginForm" );
		var $loginContainer = $( "#lobby #loginPageContainer" );
		var action = $loginForm.attr( "action" );

		$loginForm.validate().form();

		if ( $loginForm.valid() )
		{
			$loginContainer.hide();
			$.ajax( {
				url: action,
				type: "POST",
				beforeSend: self.UTILS.loader.show( true ),
				data: $loginForm.serialize(),
				success: function ( result )
				{
					if ( result.validationError )
					{
						self.UTILS.loader.hide( false );
						$loginContainer.show();
						alert( "Nazwa użytkownika lub hasło jest nieprawidłowe" );
					} else
					{
						window.location = "/home";
					}
				},
				error: function ()
				{
					self.UTILS.loader.hide( false );
					$loginContainer.show();
					alert( "Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz." );
				}
			} );
		}

		return false;
	};

	self.expandEventOverviewItemOnClick = function ( element )
	{
		var $element = $( element );
		var $expandDiv = $element.siblings( '.event-block-expand' );
		$element.toggleClass( "selected" );

		if ( !$element.hasClass( "selected" ) )
		{
			$expandDiv.slideUp( function ()
			{
				$element.scrollTo( 500, 200 );
			} );

		}
		else
		{
			$expandDiv.slideDown();
			$element.scrollTo( 500, 80 );
		}
	}

	self.closeLoginPopupOnClick = function ()
	{
		$( "#loginPageContainer" ).hide();
		$( "#lobbyLogo" ).scrollTo();
	};

	self.closeRegisterPopupOnClick = function ()
	{
		$( "#registerPageContainer" ).hide();
		$( "#lobbyLogo" ).scrollTo();
	};

	self.registerUserOnClick = function ()
	{
		//TODO: in _register page make sure we have labels corresponding to their form textboxes (basically check all pages with forms that their html is correct)
		//TODO: add ajax code to WebApiCaller.js class

		var $dateBirthValidationMsg;
		var $registerForm = $( "#registerForm" );
		$registerForm.find( ".summary-validation-errors" ).empty();
		var action = $registerForm.attr( "action" );

		var day = $( "#birthDateDayTxtBox" ).val();
		var month = $( "#birthDateMonthTxtBox" ).val();
		var year = $( "#birthDateYearTxtBox" ).val();

		if ( !self.validateDate( day, month, year ) )
		{
			$dateBirthValidationMsg = $( "#lobby #registerPageContainer #birthDateValidationErrorMsg" );
			$( "#lobby #registerPageContainer .register-birthdate-txtbox" ).addClass( "input-validation-error" );
			$dateBirthValidationMsg.show();
			return false;
		}

		$registerForm.validate().form();

		if ( $registerForm.valid() )
		{
			$.ajax( {
				url: action,
				type: "POST",
				beforeSend: function () { self.UTILS.loader.show( true ); $( "#lobby #registerPageContainer" ).hide() },
				data: $registerForm.serialize(),
				success: function ( result )
				{
					self.UTILS.loader.hide( false );

					if ( result.isRegisterSuccess === false )
					{
						$( "#lobby #registerPageContainer" ).show()
						displayErrors( result.errors );
					} else
					{
						window.location = "/home";
					}
				},
				error: function ()
				{
					self.UTILS.loader.hide( false );
					$( "#lobby #registerPageContainer" ).show()
					alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				}
			} );
		};

		return false;

		function displayErrors( errors )
		{

			var label;
			var error;

			for ( var i = 0; i < errors.length; i++ )
			{
				error = errors[i];

				if ( error.Value && error.Value.length > 0 )
				{
					$registerForm.find( ".summary-validation-errors" ).append( "<div>" + error.Value[0] + "</div>" );
				}

				if ( error.Key !== "" )
				{
					label = $registerForm.find( "input[name = '" + error.Key + "']" ).removeClass( "valid" ).addClass( "input-validation-error" ).next().removeClass( "field-validation-valid" ).addClass( "field-validation-error" );
					label.html( error.Value[0] );
				}
			}
		}
	};

	self.updateUserOnClick = function ()
	{
		var $dateBirthValidationMsg;
		var $registerForm = $( "#updateProfileForm" );
		$registerForm.find( ".summary-validation-errors" ).empty();
		var action = $registerForm.attr( "action" );

		var day = $( "#birthDateDayTxtBoxUpdateProfile" ).val();
		var month = $( "#birthDateMonthTxtBoxUpdateProfile" ).val();
		var year = $( "#birthDateYearTxtBoxUpdateProfile" ).val();

		if ( !self.validateDate( day, month, year ) )
		{
			$dateBirthValidationMsg = $( "#details #birthDateValidationErrorMsgUpdateProfile" );
			$( "#details .register-birthdate-txtbox" ).addClass( "input-validation-error" );
			$dateBirthValidationMsg.show();
			return false;
		}

		$registerForm.validate().form();

		if ( $registerForm.valid() )
		{
			$.ajax( {
				url: action,
				type: "POST",
				beforeSend: self.UTILS.loader.show( true ),
				data: $registerForm.serialize() + "&RegisterModel.Password=DummyPassword&RegisterModel.ConfirmPassword=DummyPassword&RegisterModel.UserName=DummyUserName",
				success: function ( result )
				{
					self.UTILS.loader.hide( true );

					if ( result.IsSuccess === false )
					{
						alert( result.Message )
					}
				},
				error: function ()
				{
					self.UTILS.loader.hide( true );
					alert( "Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz." );
				}
			} );
		};

		return false;

		//TODO: make sure errors are passed from the server (the same as in registerUser)
		function displayErrors( errors )
		{
			var label;
			var error;

			for ( var i = 0; i < errors.length; i++ )
			{
				error = errors[i];

				if ( error.Value && error.Value.length > 0 )
				{
					$registerForm.find( ".summary-validation-errors" ).append( "<div>" + error.Value[0] + "</div>" );
				}

				if ( error.Key !== "" )
				{
					label = $registerForm.find( "input[name = '" + error.Key + "']" ).removeClass( "valid" ).addClass( "input-validation-error" ).next().removeClass( "field-validation-valid" ).addClass( "field-validation-error" );
					label.html( error.Value[0] );
				}
			}
		}
	}

	self.validateDate = function ( day, month, year )
	{

		if ( day == "" || month == "" || year == "" )
		{
			return true;
		}

		var birthDate = day + "/" + month + "/" + year;
		return isDate( birthDate );

		//Validates a date input -- http://jquerybyexample.blogspot.com/2011/12/validate-date-    using-jquery.html
		function isDate( txtDate )
		{

			var currVal = txtDate;
			if ( currVal == '' )
				return false;

			//Declare Regex  
			var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
			var dtArray = currVal.match( rxDatePattern ); // is format OK?

			if ( dtArray == null )
				return false;

			//Checks for dd/mm/yyyy format.
			var dtDay = dtArray[1];
			var dtMonth = dtArray[3];
			var dtYear = dtArray[5];

			if ( dtMonth < 1 || dtMonth > 12 )
				return false;
			else if ( dtDay < 1 || dtDay > 31 )
				return false;
			else if ( ( dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11 ) && dtDay == 31 )
				return false;
			else if ( dtMonth == 2 )
			{
				var isleap = ( dtYear % 4 == 0 && ( dtYear % 100 != 0 || dtYear % 400 == 0 ) );
				if ( dtDay > 29 || ( dtDay == 29 && !isleap ) )
					return false;
			}

			return true;
		}
	};

	self.validateAddEventFormDates = function ( startH, endH, startM, endM )
	{
		var startDate = new Date( 2014, 1, 1, startH, startM, 0, 0 );
		var endDate = new Date( 2014, 1, 1, endH, endM, 0, 0 );

		var timeDiff = endDate.getTime() - startDate.getTime();

		if ( timeDiff < 0 )
		{
			return false;
		}

		var diffMinutes = Math.ceil( timeDiff / ( ( 1000 * 3600 ) / 60 ) );

		if ( diffMinutes < 10 )
		{
			return false;
		}

		return true;
	};

	self.showAddPrivateCalendarEventPopupOnClick = function ( element, data, e )
	{
		var $calendar = $( "#calendar" );
		$( element ).hide();
		self.UTILS.loader.$overlay.show();

		//////////////////////////////////////////////////
		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.find( ".popupbox-header-title" ).text( "Dodaj do kalendarza" );

		var $addBtn = $addEventContainer.find( "#btnAddNewEvent" );
		$addBtn.text( "dodaj" );
		$addBtn.attr( "data-bind", "click: $root.addEventOnClick" )

		ko.unapplyBindings( $addBtn[0] );
		ko.applyBindings( self, $addBtn[0] );
		///////////////////////////////////////////////////

		var $eventTitle = $addEventContainer.find( "#Event_Title" );

		var dayNumber = $( element ).siblings( ".day" ).text();
		dayNumber = dayNumber < 10 ? '0' + dayNumber : dayNumber;

		var currMonth = self.calendarPageDisplayDate.month();
		var currYear = self.calendarPageDisplayDate.year();

		var $cell = $( element ).closest( ".calendar-cell" );
		if ( $cell.hasClass( "prev-month-cell" ) )
		{
			if ( currMonth == 1 )
			{
				currMonth = 12;
				currYear = currYear - 1;
			} else
			{
				currMonth = currMonth - 1;
			}
		}
		else if ( $cell.hasClass( "next-month-cell" ) )
		{
			if ( currMonth == 12 )
			{
				currMonth = 1;
				currYear = currYear + 1;
			} else
			{
				currMonth = currMonth + 1;
			}
		}

		var monthNumber = ( currMonth ) < 10 ? '0' + ( currMonth ) : currMonth;

		self.resetAndSetPrivacyLvlToObservableEvent( dayNumber, monthNumber, currYear, "private", self.eventPrivacyLevels["private"] );

		var top = $( "#slide-item-calendar" ).parent().scrollTop();
		$addEventContainer.css( "top", top + 10 );
		$addEventContainer.fadeIn();
		$eventTitle.focus();

		if ( e )
		{
			e.stopPropagation();
		}
	};

	self.showAddPublicEventPopupOnClick = function ( element, data, e )
	{
		var day = self.todayDate.day < 10 ? '0' + self.todayDate.day : self.todayDate.day;
		var month = self.todayDate.month < 10 ? '0' + self.todayDate.month : self.todayDate.month;

		self.resetAndSetPrivacyLvlToObservableEvent( day, month, self.todayDate.year, "public", self.eventPrivacyLevels["public"] );

		///////////////////////////////////////////////////
		self.UTILS.loader.$overlay.show();

		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.find( ".popupbox-header-title" ).text( "Dodaj do tablicy wydarzeń" );

		var $addBtn = $addEventContainer.find( "#btnAddNewEvent" );
		$addBtn.text( "dodaj" );
		$addBtn.attr( "data-bind", "click: $root.addEventOnClick" )

		ko.unapplyBindings( $addBtn[0] );
		ko.applyBindings( self, $addBtn[0] );
		///////////////////////////////////////////////////

		$addEventContainer.fadeIn();
		var $eventTitle = $addEventContainer.find( "#Event_Title" ).focus();
	};

	self.showAddPrivateEventLobbyPopupOnClick = function ( element, data, e )
	{
		var day = self.todayDate.day < 10 ? '0' + self.todayDate.day : self.todayDate.day;
		var month = self.todayDate.month < 10 ? '0' + self.todayDate.month : self.todayDate.month;

		self.resetAndSetPrivacyLvlToObservableEvent( day, month, self.todayDate.year, "private", self.eventPrivacyLevels["private"] );

		var $lobby = $( "#lobby" );
		var $calendar = $( "#calendar" );
		var $details = $( "#details" );

		$lobby.siblings( ".page-overlay" ).hide();
		$calendar.siblings( ".page-overlay" ).hide();
		$details.siblings( ".page-overlay" ).hide();

		var $overlay = $lobby.siblings( ".page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();

		//////////////////////////////////////////////////
		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.detach().prependTo( $lobby );
		$addEventContainer.find( ".popupbox-header-title" ).text( "Dodaj do kalendarza" );

		var $addBtn = $addEventContainer.find( "#btnAddNewEvent" );
		$addBtn.find( "span" ).text( "+" );
		$addBtn.attr( "data-bind", "click: $root.addEventOnClick" )

		ko.unapplyBindings( $addBtn[0] );
		ko.applyBindings( self, $addBtn[0] );
		///////////////////////////////////////////////////


		var top = $( "#slide-item-lobby" ).parent().scrollTop();
		$addEventContainer.css( "top", top + 30 );
		$addEventContainer.fadeIn();
		$addEventContainer.find( "#Event_Title" ).focus();
	};

	self.resetAndSetPrivacyLvlToObservableEvent = function ( day, month, year, privacyName, privacyValue )
	{
		self.EVENT_MANAGER.resetKKEventModelObservable( self.observableEvent, day, month, year );
		self.observableEvent.privacyLevel.name = privacyName;
		self.observableEvent.privacyLevel.value = privacyValue;
	}

	self.redisplayCalendarAtChosenMonth = function ( monthNum )
	{
		var $calendar = $( "#calendar" );
		var $addNewEvent = $( "#addNewEventContainer" );

		self.UTILS.loader.show( false );

		$addNewEvent.detach();

		$calendar.find( ".month-name-header-container .current-month-name-calendar" ).removeClass( "current-month-name-calendar" );
		$calendar.find( ".month-name-header-container:eq( '" + ( monthNum - 1 ) + "' )" ).addClass( "current-month-name-calendar" );

		//calendar widget accepts months as 0 - 11 format
		$calendar.calendarWidget( { month: monthNum - 1, year: self.calendarPageDisplayDate.year() } );
		ko.unapplyBindings( $calendar[0] );
		ko.applyBindings( self, $calendar[0] );

		$calendar.append( '<div id="calendar-navigation-arrows-left"><img src="Images/Nav/arrowLeft.png" alt="arrow-left"/></div>' );
		$calendar.append( '<div id="calendar-navigation-arrows-right"><img src="Images/Nav/arrowRight.png" alt="arrow-Right"/></div>' );
		$addNewEvent.prependTo( $calendar );

		var $leftSideCalendar = $( "#leftSideCalendar" );
		var $rightSideCalendar = $( "#rightSideCalendar" );

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

		self.calendarPageDisplayDate.month( monthNum );

		for ( var i = -1; i < 2; i++ )
		{
			//December previous year
			if ( self.calendarPageDisplayDate.month() + i == 0 )
			{
				self.calendarPageMonthEvents = self.EVENT_MANAGER.getEventsForGivenMonth( self.calendarPageDisplayDate.year() - 1, 12, self.myEventTree );
			}
				//January next year
			else if ( self.calendarPageDisplayDate.month() + i == 13 )
			{
				self.calendarPageMonthEvents = self.EVENT_MANAGER.getEventsForGivenMonth( self.calendarPageDisplayDate.year() + 1, 1, self.myEventTree );
			}
				//all other months
			else
			{
				self.calendarPageMonthEvents = self.EVENT_MANAGER.getEventsForGivenMonth( self.calendarPageDisplayDate.year(), self.calendarPageDisplayDate.month() + i, self.myEventTree );
			}

			//draw to calendar
			ko.utils.arrayForEach( self.calendarPageMonthEvents, function ( event )
			{
				self.drawEventToCalendar( event );
			} );
		}

		self.UTILS.loader.hide( true );
	};

	self.redisplayCalendarAtChosenYear = function ( year )
	{
		self.calendarPageDisplayDate.year( year );
		self.redisplayCalendarAtChosenMonth( self.calendarPageDisplayDate.month() );
	};

	self.showEventBlockInfoOnDetailsPageEventRectangleClick = function ( id )
	{
		$( "#details .event-block-container[data-eventid='" + id + "']" ).scrollTo( 500 );
	};

	self.closeAllSelectedEventsListContainerOnClick = function ()
	{
		var $menuItemContainer, $eventsMenuContainer;

		switch ( self.currentPage() )
		{
			case 0:
				self.lobbyPage.upcomingEventsPart.eventListMenuVM.isOpen( false );

				$eventsMenuContainer = $( "#lobby .events-menu-container" );
				$eventsMenuContainer.find( ".menu-item-container" ).each( function ()
				{
					$menuItemContainer = $( this );

					if ( $menuItemContainer.hasClass( "selected" ) )
					{
						$menuItemContainer.removeClass( "selected" );
						$menuItemContainer.css( "top", "0px" );
					}
				} );

				self.lobbyPage.upcomingEventsPart.eventListMenuVM.selectedEventKindValues = [];
				self.lobbyPage.upcomingEventsPart.eventListMenuVM.menuItems.publicEvents.selectedEvents.old( [] );
				self.lobbyPage.upcomingEventsPart.eventListMenuVM.menuItems.publicEvents.selectedEvents.upcoming( [] );

				$( "#lobbyTableOfEventsSection" ).scrollTo( 500, 60 );
				return true;
			case 2:
				self.detailsPageJournalMenu.isOpen( false );
				self.showDetailsPageClockContainer();

				$eventsMenuContainer = $( "#details .events-menu-container" );
				$eventsMenuContainer.find( ".menu-item-container" ).each( function ()
				{
					$menuItemContainer = $( this );

					if ( $menuItemContainer.hasClass( "selected" ) )
					{
						$menuItemContainer.removeClass( "selected" );
						$menuItemContainer.css( "top", "0px" );
					}
				} );

				self.detailsPageJournalMenu.selectedEventKindValues = [];
				self.detailsPageJournalMenu.menuItems.myCalendar.selectedEvents.old( [] );
				self.detailsPageJournalMenu.menuItems.myCalendar.selectedEvents.upcoming( [] );
				self.detailsPageJournalMenu.menuItems.manageOwnPublicEvents.selectedEvents.old( [] );
				self.detailsPageJournalMenu.menuItems.manageOwnPublicEvents.selectedEvents.upcoming( [] );
				self.detailsPageJournalMenu.selectedMenuItem( 1 );
				$( "#detailsPanel" ).scrollTo( 500, 60 );
				return true;
			default: return false;
		}
	};

	self.setCalendarPlacementRow = function ( dayEvents )
	{
		self.detailsPageEventMostBottomRow = 1;
		var anotherEvent;
		var eStartH, eEndH, eStartM, eEndM;
		var eventsInTheSameDayTemp = [];
		var event;

		for ( var i in dayEvents )
		{
			event = dayEvents[i];
			event.calendarPlacementRow = 1;
			eStartH = event.startDate.startHour;
			eEndH = event.startDate.endHour;
			eStartM = event.startDate.startMinute;
			eEndM = event.startDate.endMinute

			for ( var j = 0; j < eventsInTheSameDayTemp.length; j++ )
			{
				anotherEvent = eventsInTheSameDayTemp[j];

				var aeStartH = anotherEvent.startDate.startHour;
				var aeEndH = anotherEvent.startDate.endHour;
				var aeStartM = anotherEvent.startDate.startMinute;
				var aeEndM = anotherEvent.startDate.endMinute

				//TODO: looks too complex, simplify it ;) good luck 
				var firstCheck = ( eStartH > aeStartH && eStartH < aeEndH ) || ( aeStartH > eStartH && aeStartH < eEndH );
				var secondCheck = ( eStartH == aeStartH && ( eStartM > aeStartM && ( ( eStartH < aeEndH ) || ( eStartM < aeEndM ) ) ) );
				var thirdCheck = ( aeStartH == eStartH && ( aeStartM > eStartM && ( ( aeStartH < eEndH ) || ( aeStartM < eEndM ) ) ) );
				var fourthCheck = ( eStartH == aeStartH && eStartM == aeStartM ) || ( eEndH == aeEndH && eEndM == aeEndM );
				var fifthCheck = ( eEndH == aeStartH && eEndM > aeStartM ) || ( aeEndH == eStartH && aeEndM > eStartM );

				if ( firstCheck || secondCheck || thirdCheck || fourthCheck || fifthCheck )
				{
					//there is conflict

					if ( event.calendarPlacementRow == anotherEvent.calendarPlacementRow )
					{
						event.calendarPlacementRow++;
					}
				}

				if ( event.calendarPlacementRow > self.detailsPageEventMostBottomRow )
				{
					self.detailsPageEventMostBottomRow = event.calendarPlacementRow;
				}
			}

			eventsInTheSameDayTemp.push( event );

			//TODO: current sorting not optimal, correct way is to insert value at the correct index
			eventsInTheSameDayTemp.sort( function ( a, b )
			{
				return parseInt( a.calendarPlacementRow, 10 ) - parseInt( b.calendarPlacementRow, 10 )
			} );

		}
	};

	self.drawAnalogClock = function ()
	{
		var paper = Raphael( "clockCanvas", 200, 160 );
		//var clock = paper.circle(100,100,60);
		//clock.attr({"fill":"#000000"})  
		var hour_sign, hour_hand, minute_hand, second_hand;
		for ( var i = 0; i < 12; i++ )
		{
			var start_x = 100 + Math.round( 50 * Math.cos( 30 * i * Math.PI / 180 ) );
			var start_y = 100 + Math.round( 50 * Math.sin( 30 * i * Math.PI / 180 ) );
			var end_x = 100 + Math.round( 55 * Math.cos( 30 * i * Math.PI / 180 ) );
			var end_y = 100 + Math.round( 55 * Math.sin( 30 * i * Math.PI / 180 ) );
			hour_sign = paper.path( "M" + start_x + " " + start_y + "L" + end_x + " " + end_y );
			hour_sign.attr( { stroke: "rgb(207, 199, 173)", "stroke-width": 1 } );
		}
		hour_hand = paper.path( "M100 100L100 60" );
		hour_hand.attr( { stroke: "rgb(207, 199, 173)", "stroke-width": 6 } );
		minute_hand = paper.path( "M100 100L100 55" );
		minute_hand.attr( { stroke: "rgb(207, 199, 173)", "stroke-width": 4 } );
		second_hand = paper.path( "M100 110L100 50" );
		second_hand.attr( { stroke: "rgb(207, 199, 173)", "stroke-width": 1 } );

		// var pin = paper.circle(100, 100, 10);
		// pin.attr({"fill":"#000000"});    

		update_clock()
		setInterval( function () { update_clock() }, 1000 );


		function update_clock()
		{
			var now = new Date();
			var hours = now.getHours();
			var minutes = now.getMinutes();
			var seconds = now.getSeconds();
			hour_hand.rotate( 30 * hours + ( minutes / 2.5 ), 100, 100 );
			minute_hand.rotate( 6 * minutes, 100, 100 );
			second_hand.rotate( 6 * seconds, 100, 100 );
		}
	};

	self.drawDigitalClock = function ()
	{
		setInterval( function () { updateDigitalClock() }, 1000 );

		function updateDigitalClock()
		{
			var currentTime = new Date();
			var currentHours = currentTime.getHours();
			var currentMinutes = currentTime.getMinutes();
			var currentSeconds = currentTime.getSeconds();

			// Pad the minutes and seconds with leading zeros, if required
			currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
			currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;
			currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
			// Choose either "AM" or "PM" as appropriate
			//var timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";

			// Convert the hours component to 12-hour format if needed
			//currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;

			// Convert an hours component of "0" to "12"
			//currentHours = (currentHours == 0) ? 0 : currentHours;

			// Compose the string for display
			var currentTimeString = currentHours + ":" + currentMinutes;


			$( "#details #digitalClock" ).html( currentTimeString );

		}
	};

	self.showDetailsPageClockContainer = function ()
	{
		$( "#details #clockCanvas" ).fadeIn();
	};

	self.hideDetailsPageClockContainer = function ()
	{
		$( "#details #clockCanvas" ).hide();
	};

	////////////////////////////////////////////////////////////

	self.dzieuoEvents = function ()
	{
		var $dzVerticalPaging = $( '#dzVerticalPaging' );
		var $dzVerticalNav = $( '#dzVerticalNav' );
		var $loginbar = $( "#loginBarContainer" );

		$( document ).bind( "horizontal_transition:before", function ( e, arg )
		{
			switch ( arg.targetColumn )
			{
				case 0:
					$loginbar.css( { 'right': '18%' } );
					break;
				case 1:
					$loginbar.css( { 'right': '9.4%' } );
					break;
				case 2:
					$dzVerticalPaging.css( { 'right': '2%' } );
					$dzVerticalNav.css( { 'right': '8.5%' } );

					$loginbar.css( { 'right': '9.6%' } );
					break;
				default:

			}

			switch ( arg.currentColumn )
			{
				case 0:
					break;
				case 1:
					break;
				case 2:
					$dzVerticalPaging.css( { 'right': '8.5%' } );
					$dzVerticalNav.css( { 'right': '16%' } );
					break;
				default:

			}
		} );

		$( document ).bind( "horizontal_transition:after", function ( e, arg )
		{
			switch ( arg.targetColumn )
			{
				case 0:
					// for js-masonry bug where sometimes masonry grid container does not render properly  
					window.dispatchEvent( new Event( 'resize' ) );
					break;
				case 1:
					break;
				case 2:
					break;
				default:
			}
		} );

	}();

	//////////////////////////////////////////////////////
	// KO extention/helper methods
	//////////////////////////////////////////////////////

	ko.unapplyBindings = function ( node )
	{
		// unbind events
		//$node.find("*").each(function () {
		//	$(this).unbind();
		//});

		// Remove KO subscriptions and references
		ko.cleanNode( node );
	};
};