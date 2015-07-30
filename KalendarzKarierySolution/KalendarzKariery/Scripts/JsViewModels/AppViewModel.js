function AppViewModel( date, weekday, userName, spinner )
{
	var self = this;

	//////////////////////////////////////////////////////////
	//utils, managers etc
	//////////////////////////////////////////////////////////

	self.UTILS = ( function ()
	{
		var Utils = function ()
		{
			var colorHelper = new EventColorHelper();
			var webApiCaller = new WebApiCaller( self );
			var eventTreeBuilder = new TreeBuilder( self );

			this.colorHelper = colorHelper;
			this.webApiCaller = webApiCaller;
			this.eventTreeBuilder = eventTreeBuilder;
		}
		return new Utils();
	} )();
	self.EVENT_MANAGER = new EventManager( self );
	self.NOTE_MANAGER = new NoteManager( self );

	//////////////////////////////////////////////////////////
	//public properties
	//////////////////////////////////////////////////////////
	var year = date.getFullYear(), month = date.getMonth(), day = date.getDate();

	//ajax loader 
	self.spinner = spinner;

	//0 - lobby page
	//1 - calendar page
	//2 - details page
	self.currentPage = 0;

	self.todayDate = {
		"now": function () { return new Date() },
		"day": day,
		//month starts from 1 to 12
		"month": month + 1,
		"year": year,
		"weekday": date.getDay(),
		"getMonthName": function ()
		{
			return self.monthNames[( this.month - 1 )];
		},
		"getDayName": function ()
		{
			return this.weekday == 0 ? self.dayNames[6] : self.dayNames[this.weekday - 1];
		}
	}

	self.monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
	self.dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
	self.userName = userName;

	self.eventKinds = [];
	self.eventPrivacyLevels = {};

	// is used when adding or editing event
	self.observableEvent = new KKEventModelObservable();

	// is used when adding note-
	self.observableNote = new KKNoteModelObservable();

	// month starts from 1 to 12
	self.detailsPageDisplayDate = {
		"year": ko.observable( year ),
		"month": ko.observable( month + 1 ),
		"day": ko.observable( day ),
		"weekday": ko.observable( weekday ),
		"getMonthName": function ()
		{
			return self.monthNames[this.month() - 1];
		},
		"getDayName": function ()
		{
			return self.dayNames[this.weekday()];
		}
	};

	// used to specify the most bottom row of events in details page in the daily plan table
	self.detailsPageEventMostBottomRow = 1;

	//month starts from 1 to 12
	self.calendarPageDisplayDate = {
		"year": ko.observable( year ),
		"month": ko.observable( month + 1 )
	};

	self.addNewEvent_Day = ko.observable( 0 );

	self.calendarDayEventsToUpdate = {
		"day": 0,
		"month": 0,
		"events": null
	}

	self.calendarPageMonthEvents = [];
	self.detailsPageDayEvents = ko.observableArray( [] );
	self.detailsPageDayNotes = ko.observableArray( [] );

	//TODO: change into event tree with arrays grouped by event kind
	self.detailsPageSelectedEvents = {
		"old": ko.observableArray( [] ),
		"upcoming": ko.observableArray( [] ),
		"settings": {
			"pageName": "details",
			"showOldEvents": ko.observable( false )
		},
		"selectedKindValues": []
	}

	//TODO: change into event tree with arrays grouped by event kind
	self.lobbyPageSelectedEvents = {
		"old": ko.observableArray( [] ),
		"upcoming": ko.observableArray( [] ),
		"settings": {
			"pageName": "lobby",
			"showOldEvents": ko.observable( false )
		},
		"selectedKindValues": []
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

	self.myEventTreeCountBasedOnEventKind = null
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
		var privacyLvlValue = self.observableEvent.privacyLevel.value;
		var eventKindValue = self.observableEvent.kind.value();

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

			var callback = function ( result, appViewModel )
			{
				var kkEvent, date = new Date();

				if ( result.IsSuccess === false )
				{
					appViewModel.hideLoader();
					$( "#addNewEventContainer" ).show();
					alert( result.Message );
				} else
				{
					kkEvent = self.EVENT_MANAGER.getNewKKEventModel(
					appViewModel.userName,
					appViewModel.observableEvent.address.street(),
					appViewModel.observableEvent.address.city(),
					appViewModel.observableEvent.address.zipCode(),
					appViewModel.observableEvent.description(),
					appViewModel.observableEvent.details(),
					minutes,
					appViewModel.observableEvent.kind.value(),
					appViewModel.observableEvent.kind.name(),
					result.EventId,
					appViewModel.observableEvent.occupancyLimit(),
					appViewModel.observableEvent.privacyLevel.name,
					appViewModel.observableEvent.privacyLevel.value,
					new KKEventDateModel( startMinute, endMinute, startHour, endHour, day, month, year ),
					appViewModel.observableEvent.name(),
					appViewModel.observableEvent.urlLink(),
					appViewModel.observableEvent.price(),
					new KKDateModel( date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getFullYear() )
					);

					var dayEvents = appViewModel.EVENT_MANAGER.addEvent( kkEvent );

					appViewModel.setCalendarPlacementRow( dayEvents );
					appViewModel.redrawCalendarCell( dayEvents, appViewModel.addNewEvent_Day(), kkEvent.startDate.month );

					appViewModel.hideLoader( $( "#addNewEventContainer" ).closest( ".main-section" ).siblings( ".dotted-page-overlay" ) );
				}
			};

			//////////////////////////////////////////////
			//call WebAPI - Add new event
			//////////////////////////////////////////////
			self.UTILS.webApiCaller.callAddEvent( data, callback );
		}
	};

	self.updateEventOnClick = function ()
	{
		var $addEventForm = $( "#addEventForm" );
		var privacyLvlValue = self.observableEvent.privacyLevel.value;
		var eventKindValue = self.observableEvent.kind.value();

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
			var callback = function ( result, appViewModel )
			{
				var kkEvent, oldEvent;

				if ( result.IsSuccess === false )
				{
					appViewModel.hideLoader();
					$( "#addNewEventContainer" ).show();
					alert( result.Message );
				} else
				{
					oldEvent = self.EVENT_MANAGER.getEventByDateAndId( result.EventId, year, month, day, self.myEventTree );
					kkEvent = self.EVENT_MANAGER.getNewKKEventModel(
					appViewModel.userName,
					appViewModel.observableEvent.address.street(),
					appViewModel.observableEvent.address.city(),
					appViewModel.observableEvent.address.zipCode(),
					appViewModel.observableEvent.description(),
					appViewModel.observableEvent.details(),
					minutes,
					appViewModel.observableEvent.kind.value(),
					appViewModel.observableEvent.kind.name(),
					result.EventId,
					appViewModel.observableEvent.occupancyLimit(),
					appViewModel.observableEvent.privacyLevel.name,
					appViewModel.observableEvent.privacyLevel.value,
					new KKEventDateModel( startMinute, endMinute, startHour, endHour, day, month, year ),
					appViewModel.observableEvent.name(),
					appViewModel.observableEvent.urlLink(),
					appViewModel.observableEvent.price(),
					oldEvent.dateAdded
					);

					appViewModel.EVENT_MANAGER.removeEvent( result.EventId, year, month, day );
					var dayEvents = appViewModel.EVENT_MANAGER.addEvent( kkEvent );

					appViewModel.setCalendarPlacementRow( dayEvents );
					appViewModel.redrawCalendarCell( dayEvents, kkEvent.startDate.day, kkEvent.startDate.month );

					appViewModel.hideLoader( $( "#addNewEventContainer" ).closest( ".main-section" ).siblings( ".dotted-page-overlay" ) );
				}
			};

			//////////////////////////////////////////////
			//call WebAPI - Add new event
			//////////////////////////////////////////////
			self.UTILS.webApiCaller.callUpdateEvent( data, callback );
		}
	}

	self.AddNoteOnClick = function ()
	{
		if ( self.observableNote.data() == "" )
		{
			return false;
		}

		data = 'Data=' + self.observableNote.data();
		data += '&DisplayDate.Year=' + self.detailsPageDisplayDate.year();
		data += '&DisplayDate.Month=' + self.detailsPageDisplayDate.month();
		data += '&DisplayDate.day=' + self.detailsPageDisplayDate.day();

		var callback = function ( result, appViewModel, $loader )
		{
			var displayDate, kkNote, date = new Date();

			if ( result.IsSuccess === false )
			{
				appViewModel.hideLoader( $loader );
				alert( result.Message );
			} else
			{
				displayDate = new KKDateModel( null, null, self.detailsPageDisplayDate.day(), self.detailsPageDisplayDate.month(), self.detailsPageDisplayDate.year() );

				kkNote = self.NOTE_MANAGER.getNewKKNoteModel( result.NoteId, appViewModel.observableNote.data(), appViewModel.userName, appViewModel.observableNote.privacyLevel.name,
					appViewModel.observableNote.privacyLevel.value, displayDate, false, new KKDateModel( date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getFullYear() ) );
				self.NOTE_MANAGER.addNote( kkNote );

				appViewModel.observableNote.data( "" );
				appViewModel.hideLoader( $loader );
			}
		}

		//////////////////////////////////////////////
		//call WebAPI - Add new note
		//////////////////////////////////////////////
		self.UTILS.webApiCaller.callAddNote( data, callback );
	};

	self.prepareDeleteEventDetailsPageOnDeleteLinkClick = function ( id, year, month, day )
	{
		var $popup = $( "#details" ).siblings( ".confirmation-popupbox-container" );
		var $yesBtn = $popup.find( ".confirmation-popupbox-yesbtn" );
		$yesBtn.attr( "data-bind", "click: function () { $root.deleteEventDetailsPageOnConfirmationYesBtnClick($element, " + id + "," + year + "," + month + "," + day + ")}" );

		self.showConfirmationPopupBox( $popup, "Czy napewno chcesz usunąć wskazane wydarzenie?" );

		ko.unapplyBindings( $yesBtn[0] );
		ko.applyBindings( self, $yesBtn[0] );
	};

	self.prepareDeleteNoteDetailsPageOnDeleteLinkClick = function ( id, year, month, day )
	{
		var $popup = $( "#details" ).siblings( ".confirmation-popupbox-container" );
		var $yesBtn = $popup.find( ".confirmation-popupbox-yesbtn" );
		$yesBtn.attr( "data-bind", "click: function () { $root.deleteNoteDetailsPageOnConfirmationYesBtnClick($element, " + id + "," + year + "," + month + "," + day + ")}" );

		self.showConfirmationPopupBox( $popup, "Czy napewno chcesz usunąć wskazaną notatke?" );

		ko.unapplyBindings( $yesBtn[0] );
		ko.applyBindings( self, $yesBtn[0] );
	};

	self.deleteEventDetailsPageOnConfirmationYesBtnClick = function ( element, id, year, month, day )
	{
		var callback = function ( result, $loader, appViewModel )
		{
			if ( result.IsSuccess === false )
			{
				appViewModel.hideLoader( $loader );

				//TODO: change alert to some error popop or error page...
				alert( result.Message );
			} else
			{
				appViewModel.hideLoader( $loader );
				var $container = $( "#details #detailsEventsAndNotesContainer .details-event-block-container[data-eventid='" + id + "']" );

				$container.fadeOut( 500, function ()
				{
					$container.remove();

					appViewModel.EVENT_MANAGER.removeEvent( id, year, month, day );

					$( "#details #calendarDayDetailsContainer" ).scrollTo( 500 );

					//redraw details page event rectangle table
					appViewModel.removeEventRectanglesFromDetailsDay();
					events = appViewModel.detailsPageDayEvents();

					appViewModel.setCalendarPlacementRow( events );
					appViewModel.displayPageEventMostBottomRow = 1;

					for ( var i in events )
					{
						appViewModel.drawEventToDetailsDayTable( events[i] );
					}

					var $tableBody = $( "#calendarDayDetailsTable .table-details-body" );
					var h = ( appViewModel.displayPageEventMostBottomRow + 1 ) * 46;
					$tableBody.height( h + "px" );

					//for calendar to redraw events in day cell
					appViewModel.calendarDayEventsToUpdate.day = appViewModel.detailsPageDisplayDate.day();
					appViewModel.calendarDayEventsToUpdate.month = appViewModel.detailsPageDisplayDate.month();
					appViewModel.calendarDayEventsToUpdate.events = events;
				} );
			}
		}

		//////////////////////////////////////////////
		//call WebAPI - Delete event with given id
		//////////////////////////////////////////////
		self.UTILS.webApiCaller.callDeleteEvent( id, element, callback );
	};

	self.deleteNoteDetailsPageOnConfirmationYesBtnClick = function ( element, id, year, month, day )
	{
		var callback = function ( result, $loader, appViewModel )
		{
			if ( result.IsSuccess === false )
			{
				appViewModel.hideLoader( $loader );

				//TODO: change alert to some error popop or error page...
				alert( result.Message );
			} else
			{
				appViewModel.hideLoader( $loader );
				var $container = $( "#details #notesList .li-note-container[data-noteid='" + id + "']" );

				$container.fadeOut( 500, function ()
				{
					$container.remove();
					appViewModel.NOTE_MANAGER.removeNote( id, year, month, day );
				} );
			}
		}

		//////////////////////////////////////////////
		//call WebAPI - Delete note with given id
		//////////////////////////////////////////////
		self.UTILS.webApiCaller.callDeleteNote( id, element, callback );
	};

	self.editEventDetailsPageOnEditLinkClick = function ( id, year, month, day )
	{
		var $lobby = $( "#lobby" );
		var $calendar = $( "#calendar" );
		var $details = $( "#details" );

		$lobby.siblings( ".dotted-page-overlay" ).hide();
		$calendar.siblings( ".dotted-page-overlay" ).hide();
		$details.siblings( ".dotted-page-overlay" ).hide();

		var $overlay = $details.siblings( ".dotted-page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();

		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.detach().prependTo( $details );
		$addEventContainer.find( "legend" ).text( "Edycja wydarzenia" );

		var $addBtn = $addEventContainer.find( "#btnAddNewEvent" );
		$addBtn.attr( "data-bind", "click: $root.updateEventOnClick" )
		$addBtn.find( "span" ).text( "Zapisz zmiany" );

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

		var docScroll = $( "#slide-item-details" ).parent().scrollTop();
		$addEventContainer.css( "top", docScroll + 30 );
		$addEventContainer.show();
		$addEventContainer.find( "#Event_Title" ).focus();
	};

	self.editNoteDetailsPageOnEditLinkClick = function ( id, year, month, day )
	{
		var $editContainer = $( "<div class='edit-mode-note-container'></div>" );
		var $btns = $( "<div style='text-align:center;font-size:18px;'><span class='link save-link' style='padding:4px;color: rgb(68, 192, 64);'  data-bind='click:$root.updateNoteDetailsPageOnSaveLinkClick.bind($root," + id + ',' + year + ',' + month + ',' + day + ")'>zapisz</span><span class='link cancel-link' style='padding:4px;color:red;' data-bind='click:$root.cancelEditNoteDetailsPageOnCancelLinkClick.bind($root," + id + ")'>anuluj</span></div>" );
		var cancelLink = $btns.find( ".cancel-link" )[0];
		var saveLink = $btns.find( ".save-link" )[0];

		ko.unapplyBindings( cancelLink );
		ko.unapplyBindings( saveLink );
		ko.applyBindings( self, cancelLink );
		ko.applyBindings( self, saveLink );

		var $textbox = $( "<textarea style='width:80%;padding:10px;vertical-align:top;margin-top:20px;'/>" );
		var $container = $( "#details #detailsEventsAndNotesContainer .li-note-container[data-noteid='" + id + "']" );
		var noteText = $container.find( "pre" ).text();
		$container.find( ".note-content" ).hide();
		$textbox.val( noteText );
		$editContainer.append( $textbox ).append( $btns );
		$container.append( $editContainer ).find( "textarea" ).focus();
	};

	self.updateNoteDetailsPageOnSaveLinkClick = function ( id, year, month, day )
	{
		var $container = $( "#details #notesList .li-note-container[data-noteid='" + id + "']" );
		var text = $container.find( "textarea" ).val();

		var note = self.NOTE_MANAGER.getNoteByDateAndId( id, year, month, day );

		if ( !note )
		{
			return false;
		}

		var data = 'Data=' + text + '&Id=' + id + '&IsLineThrough=' + !note.isLineThrough;
		var callback = function ( result, appViewModel, $loader, $container, note, text )
		{
			if ( result.IsSuccess === false )
			{
				appViewModel.hideLoader( $loader );
				alert( result.Message );
			} else
			{
				appViewModel.hideLoader( $loader );
				note.data = text;
				$container.find( "pre" ).text( text );
				$container.find( ".edit-mode-note-container" ).remove();
				$container.find( ".note-content" ).show();
			}
		}

		//////////////////////////////////////////////
		//call WebAPI - Update note with given id
		//////////////////////////////////////////////
		self.UTILS.webApiCaller.callUpdateNote( data, callback, $container, note, text );
	};

	self.setLineThroughNoteDetailsPageOnLineThroughLinkClick = function ( id, year, month, day, isLineThrough )
	{

		var $container = $( "#details #notesList .li-note-container[data-noteid='" + id + "']" );
		var text = $container.find( "pre" ).text();

		var note = self.NOTE_MANAGER.getNoteByDateAndId( id, self.detailsPageDisplayDate.year(), self.detailsPageDisplayDate.month(), self.detailsPageDisplayDate.day() );

		if ( !note )
		{
			return false;
		}

		var data = 'Data=' + text + '&Id=' + id + '&IsLineThrough=' + isLineThrough;
		var callback = function ( result, appViewModel, $loader, $container, note )
		{
			var isLineThrough;

			if ( result.IsSuccess === false )
			{
				appViewModel.hideLoader( $loader );
				alert( result.Message );
			} else
			{
				isLineThrough = !note.isLineThrough();
				appViewModel.hideLoader( $loader );
				note.isLineThrough( isLineThrough );
			}
		}

		//////////////////////////////////////////////
		//call WebAPI - setLineThrough note with given id
		//////////////////////////////////////////////
		self.UTILS.webApiCaller.callSetLineThroughNote( data, callback, $container, note, isLineThrough );
	};

	self.cancelEditNoteDetailsPageOnCancelLinkClick = function ( id )
	{
		var $container = $( "#details #detailsEventsAndNotesContainer .li-note-container[data-noteid='" + id + "']" );
		$container.find( ".edit-mode-note-container" ).remove();
		$container.find( ".note-content" ).show();
	};

	self.redrawCalendarCell = function ( dayEvents, day, month )
	{
		var cellDay;

		if ( month === self.calendarPageDisplayDate.month() )
		{
			cellDay = ".day" + day;
		}
		else
		{
			cellDay = ".other-month-day" + day;
		}

		var $cellPlaceholder = $( "#calendar" ).find( cellDay ).find( ".calendar-cell-placeholder" );
		var $eventsToRemove = $cellPlaceholder.find( ".event-rectangle" );
		$eventsToRemove.remove();

		for ( var i in dayEvents )
		{
			self.drawEventToCalendar( dayEvents[i] );
		}
	}

	self.showConfirmationPopupBox = function ( $popup, txt )
	{
		var offset = $popup.closest( ".scrollable" ).scrollTop();

		var viewportHeight = $( window ).height();

		var offsetPopup = ( ( viewportHeight / 2 ) + offset ) - ( $popup.height() );
		$popup.css( "top", offsetPopup + "px" );

		$popup.find( ".confirmation-popupbox-maintext" ).text( txt );
		$popup.siblings( ".dotted-page-overlay" ).fadeIn( "fast" );
		$popup.show();
	};

	self.hideConfirmationPopupBox = function ( element )
	{
		$btn = $( element );
		$popup = $btn.closest( ".confirmation-popupbox-container" );

		$yesBtn = $popup.find( ".confirmation-popupbox-yesbtn" );
		$yesBtn.attr( "data-bind", '' );
		$popup.siblings( ".dotted-page-overlay" ).hide();
		$popup.hide();

	};

	self.showMoreOptionsInAddNewEventPopupOnClick = function ( element )
	{
		var $element = $( element );
		var $addNewEventContainer = $element.closest( "#addNewEventContainer" );
		var offset = $element.position().top + $addNewEventContainer.position().top;

		if ( $element.hasClass( "visible" ) )
		{
			$element.text( "Ukryj dodatkowe opcje -" );
			$element.closest( ".add-event-fieldset" ).find( ".more-options-container" ).slideDown();
			$element.scrollTo( 500, offset );
		} else
		{
			$element.text( "Pokaż więcej opcji +" );
			$element.closest( ".add-event-fieldset" ).find( ".more-options-container" ).slideUp();
			$addNewEventContainer.scrollTo( 500 );
		}

		$element.toggleClass( "visible" );

	}

	self.showEventDetailsOnEventBlockClick = function ( element )
	{
		var $block = $( element );
		var $eventBlockContainer;

		$eventBlockContainer = $block.closest( ".details-event-block-container" );
		$eventBlockContainer.scrollTo( 500 );
	};

	self.toggleShowOldEventsOnCheckboxClick = function ( element, lobbyOrDetailsPageSelectedEvents )
	{
		var $chkbox = $( element ).find( ".show-old-events-checkbox" );
		var eventsArr;

		if ( lobbyOrDetailsPageSelectedEvents.settings.showOldEvents() )
		{
			lobbyOrDetailsPageSelectedEvents.settings.showOldEvents( false );
			lobbyOrDetailsPageSelectedEvents.old( [] );
			$chkbox.empty();
		}
		else
		{
			lobbyOrDetailsPageSelectedEvents.settings.showOldEvents( true );

			if ( lobbyOrDetailsPageSelectedEvents.settings.pageName == "details" )
			{
				eventsArr = self.EVENT_MANAGER.getFilteredEventsFromEventTree( self.myEventTree, ["kind", "value"], lobbyOrDetailsPageSelectedEvents.selectedKindValues, "old" );
			} else{
				eventsArr = self.EVENT_MANAGER.getFilteredEventsFromEventTree( self.publicEventTree, ["kind", "value"], lobbyOrDetailsPageSelectedEvents.selectedKindValues, "old" );
			}

			lobbyOrDetailsPageSelectedEvents.old( eventsArr );
			$chkbox.text( "✓" );
		}
	};

	self.showTodayInDetailsPageCalendarDetailsTable = function ()
	{
		self.detailsPageDisplayDate.day( self.todayDate.day );
		self.detailsPageDisplayDate.month( self.todayDate.month );
		self.detailsPageDisplayDate.year( self.todayDate.year );

		//Events
		self.removeEventRectanglesFromDetailsDay();
		var events = self.EVENT_MANAGER.getEventsForGivenDay( self.todayDate.year, self.todayDate.month, self.todayDate.day )
		self.detailsPageDayEvents( events );

		//Notes
		var notes = self.NOTE_MANAGER.getNotesForGivenDay( self.todayDate.year, self.todayDate.month, self.todayDate.day )
		self.detailsPageDayNotes( notes );

		//Draw to detailsDayTable
		for ( var i in events )
		{
			self.drawEventToDetailsDayTable( events[i] );
		}

		var $calendarDayDetailsTable = $( "#details #calendarDayDetailsTable" );

		var $tableBody = $calendarDayDetailsTable.find( ".table-details-body" );
		var h = ( self.displayPageEventMostBottomRow + 1 ) * 46;
		$tableBody.height( h + "px" );

		var offset = $calendarDayDetailsTable.position().top;

		var $scrollable = $calendarDayDetailsTable.closest( ".scrollable" );
		$calendarDayDetailsTable.scrollTo( 500 );
	}

	self.changeEventCountTreeValueBasedOnEventKind = function ( countTree, event, value )
	{
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
		var cellDay, $cellPlaceholder;

		if ( event.startDate.month === self.calendarPageDisplayDate.month() )
		{
			cellDay = ".day" + parseInt( event.startDate.day, 10 );
			$cellPlaceholder = $( "#calendar" ).find( cellDay ).find( ".calendar-cell-placeholder" );
		}
		else if ( event.startDate.month < self.calendarPageDisplayDate.month() )
		{
			cellDay = ".prev-month-cell.other-month-day" + parseInt( event.startDate.day, 10 );
			$cellPlaceholder = $( "#calendar" ).find( cellDay ).find( ".calendar-cell-placeholder" );
		}
		else if ( event.startDate.month > self.calendarPageDisplayDate.month() )
		{
			cellDay = ".next-month-cell.other-month-day" + parseInt( event.startDate.day, 10 );
			$cellPlaceholder = $( "#calendar" ).find( cellDay ).find( ".calendar-cell-placeholder" );
		}

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

		var $event = $( '<div class="event-rectangle" style="top:' + ( event.calendarPlacementRow - 1 ) * 28 + 'px; left:' + left + '%; width:' + width + '%; border-color:' + event.kind.color + ';">' + event.name + '<input type="hidden" name="' + event.name + '" address="' + addressStr + '" starthour="' + event.startDate.startHour + '" endhour="' + event.startDate.endHour + '" startminute="' + event.startDate.startMinute + '" endminute="' + event.startDate.endMinute + '" ></input></div>' );

		$cellPlaceholder.append( $event );
	};

	self.drawEventToDetailsDayTable = function ( event, onAppInit )
	{
		//TODO: inject self.displayPageEventMostBottomRow into the method

		//set detailsPageBottomRow to calculate detailsPageEventsTable height based on the most bottom event.calendarPlacementRow 
		if ( event.calendarPlacementRow > self.displayPageEventMostBottomRow )
		{
			self.displayPageEventMostBottomRow = event.calendarPlacementRow;
		}

		var startMinuteOffset = event.startDate.startMinute / 60 * 100;
		var endMinuteOffset = event.startDate.endMinute / 60 * 100;
		var width = ( ( event.startDate.endHour - event.startDate.startHour ) * 100 ) - startMinuteOffset + endMinuteOffset;

		var $hourCell = $( ".hour-cell-" + event.startDate.startHour );
		var eventRectangle = '<div data-bind="click: function(){ $root.showEventBlockInfoOnDetailsPageEventRectangleClick(' + event.id + ') }" class="event-rectangle-details" style="width:' + ( width - 2 ) + '%;top : ' + ( ( ( event.calendarPlacementRow - 1 ) * 46 ) + 12 ) + 'px;left:' + ( startMinuteOffset + 1 ) + '%;border-color:' + event.kind.detailsPageEventBorderColor + ';"><span>' + event.name + '</span></div>';
		var $eventRectangle = $( eventRectangle );

		$eventRectangle.appendTo( $hourCell );
		$eventRectangle.parent();

		ko.unapplyBindings( $eventRectangle[0] );
		ko.applyBindings( self, $eventRectangle[0] );
	};

	self.removeEventRectanglesFromDetailsDay = function ()
	{
		$( "#details #calendarDayDetailsTable .event-rectangle-details" ).remove();
	};

	self.moveToDetailsPageOnCalendarCellClick = function ( element )
	{
		self.displayPageEventMostBottomRow = 1;
		var day = $( element ).attr( "dayNumber" );
		var dayInt = parseInt( day, 10 );
		self.detailsPageDisplayDate.day( dayInt );

		var weekday = $( element ).attr( "weekday" );
		self.detailsPageDisplayDate.weekday( weekday );

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

		var events = self.EVENT_MANAGER.getEventsForGivenDay( self.detailsPageDisplayDate.year(), self.detailsPageDisplayDate.month(), self.detailsPageDisplayDate.day() )
		self.detailsPageDayEvents( events );

		self.removeEventRectanglesFromDetailsDay();

		for ( var i in events )
		{
			self.drawEventToDetailsDayTable( events[i] );
		}

		var $tableBody = $( "#details #calendarDayDetailsTable .table-details-body" );
		var h = ( self.displayPageEventMostBottomRow ) * 46;
		h = h + 20;
		$tableBody.height( h + "px" );

		var $scrollable = $( "#slide-item-details" ).parent();

		window.location = "#2";

		setTimeout( function ()
		{
			$( "#details #calendarDayDetailsContainer" ).scrollTo( 100 );
		}, 10 )
	};

	self.addPublicEventToMyCalendarOnClick = function ( id, year, month, day )
	{
		var data = '?username=' + self.userName + '&eventId=' + id;
		var callback = function ( result, appViewModel, $loader )
		{
			var displayDate, event;

			if ( result.IsSuccess === false )
			{
				appViewModel.hideLoader( $loader );
				alert( result.Message );
			} else
			{
				event = self.EVENT_MANAGER.getEventByDateAndId( id, year, month, day, self.publicEventTree );
				self.EVENT_MANAGER.addEvent( event );
				appViewModel.hideLoader( $loader );
			}
		}

		self.UTILS.webApiCaller.callAddExistingEventToUser( data, callback );
	}

	self.showSelectedEventsOnMenuItemClick = function ( element, lobbyOrDetailsPageSelectedEvents )
	{
		var filteredArray;
		var $menuItem = $( element ).find( ".menu-item" );
		var eventKindValue = parseInt( $menuItem.attr( "data-eventkind" ), 10 );
		var $menuItemContainer = $menuItem.closest( ".menu-item-container" );

		$menuItemContainer.toggleClass( "selected" );

		if ( $menuItemContainer.hasClass( "selected" ) )
		{
			$menuItemContainer.css( "top", "20px" );
			$menuItemContainer.css( "border-bottom", "2px solid white" );
			$menuItemContainer.css( "border-top", "none" );

			lobbyOrDetailsPageSelectedEvents.selectedKindValues.push( eventKindValue );
			showSelectedEvents( lobbyOrDetailsPageSelectedEvents.settings.pageName );

		} else
		{
			$menuItemContainer.css( "top", "0px" );
			$menuItemContainer.css( "border", "none" );

			filteredArray = lobbyOrDetailsPageSelectedEvents.selectedKindValues.filter( function ( e ) { return e !== eventKindValue } )
			lobbyOrDetailsPageSelectedEvents.selectedKindValues = filteredArray;
			removeSelectedEvents( lobbyOrDetailsPageSelectedEvents.settings.pageName );
		}

		$menuItemContainer.scrollTo( 500 );

		function showSelectedEvents( lobbyOrDetails )
		{
			var combinedArray = [], combinedArray2 = [], arr, arr2, shownEvents;

			if ( lobbyOrDetails == "details" )
			{
				arr = self.EVENT_MANAGER.getFilteredEventsFromEventTree( self.myEventTree, ["kind", "value"], [eventKindValue], "upcoming" );
				shownEvents = lobbyOrDetailsPageSelectedEvents.upcoming();

				if ( shownEvents.length )
				{
					combinedArray = arr.concat( shownEvents );
					combinedArray.sort( function ( a, b )
					{
						return ( a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate );
					} );

					lobbyOrDetailsPageSelectedEvents.upcoming( combinedArray );
				} else
				{
					lobbyOrDetailsPageSelectedEvents.upcoming( arr );

					$( "#details #detailsPageAllEventsListContainer" ).show();
					self.hideDetailsPageClockContainer();
				}

				if ( lobbyOrDetailsPageSelectedEvents.settings.showOldEvents() )
				{
					showOldEvents( self.myEventTree );
				}
			} else
			{
				$( "#lobby #lobbyPageAllEventsListContainer" ).show();
				arr = self.EVENT_MANAGER.getFilteredEventsFromEventTree( self.publicEventTree, ["kind", "value"], [eventKindValue], "upcoming" );
				shownEvents = lobbyOrDetailsPageSelectedEvents.upcoming();

				if ( shownEvents.length )
				{
					combinedArray = arr.concat( shownEvents );
					combinedArray.sort( function ( a, b )
					{
						return ( a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate );
					} );

					lobbyOrDetailsPageSelectedEvents.upcoming( combinedArray );
				} else
				{
					lobbyOrDetailsPageSelectedEvents.upcoming( arr );
				}

				if ( lobbyOrDetailsPageSelectedEvents.settings.showOldEvents() )
				{
					showOldEvents( self.publicEventTree )
				}
			}


			function showOldEvents( eventTree )
			{
				arr2 = self.EVENT_MANAGER.getFilteredEventsFromEventTree( eventTree, ["kind", "value"], [eventKindValue], "old" );
				shownEvents = lobbyOrDetailsPageSelectedEvents.old();

				if ( shownEvents.length )
				{
					combinedArray2 = arr2.concat( shownEvents );
					combinedArray2.sort( function ( a, b )
					{
						return ( a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate );
					} );

					lobbyOrDetailsPageSelectedEvents.old( combinedArray2 );
				} else
				{
					lobbyOrDetailsPageSelectedEvents.old( arr2 );
				}
			}
		}
		function removeSelectedEvents( lobbyOrDetails )
		{
			var array, array2, $container;

			if ( lobbyOrDetails == "details" )
			{
				array = ko.utils.arrayFilter( lobbyOrDetailsPageSelectedEvents.upcoming(), function ( item )
				{
					return item.kind.value != eventKindValue;
				} );

				//array.sort(function (a, b) {
				//	return (a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate);
				//});

				lobbyOrDetailsPageSelectedEvents.upcoming( array );

				if ( lobbyOrDetailsPageSelectedEvents.settings.showOldEvents() )
				{
					array2 = ko.utils.arrayFilter( lobbyOrDetailsPageSelectedEvents.old(), function ( item )
					{
						return item.kind.value != eventKindValue;
					} );

					lobbyOrDetailsPageSelectedEvents.old( array2 );
				}

				if ( !$( "#details #detailsPanel .menu-item-container" ).hasClass( "selected" ) )
				{

					$container = $( "#details #detailsPanel #detailsPageAllEventsListContainer" );
					$container.hide();
					$container.find( ".show-old-events-checkbox" ).text( "" );
					lobbyOrDetailsPageSelectedEvents.settings.showOldEvents( false );

					self.showDetailsPageClockContainer();
				}
			} else
			{
				array = ko.utils.arrayFilter( lobbyOrDetailsPageSelectedEvents.upcoming(), function ( item )
				{
					return item.kind.value != eventKindValue;
				} );

				//array.sort(function (a, b) {
				//	return (a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate);
				//});

				lobbyOrDetailsPageSelectedEvents.upcoming( array );

				if ( lobbyOrDetailsPageSelectedEvents.settings.showOldEvents() )
				{
					array2 = ko.utils.arrayFilter( lobbyOrDetailsPageSelectedEvents.old(), function ( item )
					{
						return item.kind.value != eventKindValue;
					} );

					lobbyOrDetailsPageSelectedEvents.old( array2 );
				}

				if ( !$( "#lobby #lobbyTableOfEventsSection .menu-item-container" ).hasClass( "selected" ) )
				{
					$container = $( "#lobby #lobbyPageAllEventsListContainer" );
					$container.hide();
					$container.find( ".show-old-events-checkbox" ).text( "" );
					lobbyOrDetailsPageSelectedEvents.settings.showOldEvents( false );
				}
			}
		}
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
		//$cont.find( "#addEventForm" )[0].reset();

		$cont.closest( ".main-section" ).siblings( ".dotted-page-overlay" ).fadeOut();
		$cont.hide();
		$cont.css( "top", 30 );
		//TODO:add scroll to top 
	};

	self.showRegisterFormOnClick = function ()
	{
		var $loginForm = $( "#loginPageContainer" );
		var $registerForm = $( "#registerPageContainer" );
		var $overlay = $( "#lobby" ).siblings( ".dotted-page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();
		$loginForm.hide();
		$registerForm.fadeIn();
	};

	self.showLoginFormOnClick = function ()
	{
		var $loginForm = $( "#loginPageContainer" );
		var $registerForm = $( "#registerPageContainer" );
		var $overlay = $( "#lobby" ).siblings( ".dotted-page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();
		$registerForm.hide();
		$loginForm.fadeIn();
		var top = $loginForm.position().top;
		$( "#slide-item-lobby" ).parent().scrollTop( top );
	};

	self.loginUserOnClick = function ()
	{
		var $loader;
		var $loginForm = $( "#lobby #loginForm" );
		var $loginContainer = $( "#lobby #loginPageContainer" );
		var action = $loginForm.attr( "action" );

		$loginForm.validate().form();

		if ( $loginForm.valid() )
		{
			$loginContainer.hide();
			$loader = $loginContainer.closest( ".main-section" ).siblings( ".dotted-page-overlay" );
			$.ajax( {
				url: action,
				type: "POST",
				beforeSend: self.showLoader( $loader ),
				data: $loginForm.serialize(),
				success: function ( result )
				{
					if ( result.validationError )
					{
						self.hideLoader();
						$loginContainer.show();
						alert( "Nazwa użytkownika lub hasło jest nieprawidłowe" );
					} else
					{
						window.location = "/home";
					}
				},
				error: function ()
				{
					self.hideLoader();
					$loginContainer.show();
					alert( "Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz." );
				}
			} );
		}

		return false;
	};

	self.closeLoginPopupOnClick = function ()
	{
		var $login = $( "#loginPageContainer" );
		var $overlay = $( "#lobby" ).siblings( ".dotted-page-overlay" );

		$overlay.fadeOut();
		$login.hide();

	};

	self.closeRegisterPopupOnClick = function ()
	{
		var $register = $( "#registerPageContainer" );
		var $overlay = $( "#lobby" ).siblings( ".dotted-page-overlay" );

		$overlay.fadeOut();
		$register.hide();
	};

	self.registerUserOnClick = function ()
	{
		//TODO: in _register page make sure we have labels corresponding to their form textboxes (basically check all pages with forms that their html is correct)
		//TODO: add ajax code to WebApiCaller.js class

		var $overlay = $( "#lobby" ).siblings( ".dotted-page-overlay" );
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
				beforeSend: function () { self.showLoader(); $( "#lobby #registerPageContainer" ).hide() },
				data: $registerForm.serialize(),
				success: function ( result )
				{
					self.hideLoader();

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
					self.hideLoader();
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
		var $overlay = $( "#details" ).siblings( ".dotted-page-overlay" );

		var $dateBirthValidationMsg;
		var $registerForm = $( "#updateProfileForm" );
		$registerForm.find( ".summary-validation-errors" ).empty();
		var action = $registerForm.attr( "action" );

		var day = $( "#birthDateDayTxtBoxUpdateProfile" ).val();
		var month = $( "#birthDateMonthTxtBoxUpdateProfile" ).val();
		var year = $( "#birthDateYearTxtBoxUpdateProfile" ).val();

		if ( !self.validateDate( day, month, year ) )
		{
			$dateBirthValidationMsg = $( "#details #updateProfileContainer #birthDateValidationErrorMsgUpdateProfile" );
			$( "#details #updateProfileContainer .register-birthdate-txtbox" ).addClass( "input-validation-error" );
			$dateBirthValidationMsg.show();
			return false;
		}

		$registerForm.validate().form();

		if ( $registerForm.valid() )
		{
			$.ajax( {
				url: action,
				type: "POST",
				beforeSend: self.showLoader( $overlay ),
				data: $registerForm.serialize() + "&RegisterModel.Password=DummyPassword&RegisterModel.ConfirmPassword=DummyPassword&RegisterModel.UserName=DummyUserName",
				success: function ( result )
				{
					self.hideLoader( $overlay );

					if ( result.IsSuccess === false )
					{
						alert( result.Message )
					}
				},
				error: function ()
				{
					self.hideLoader( $overlay );
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
		var $lobby = $( "#lobby" );
		var $calendar = $( "#calendar" );
		var $details = $( "#details" );

		$lobby.siblings( ".dotted-page-overlay" ).hide();
		$calendar.siblings( ".dotted-page-overlay" ).hide();
		$details.siblings( ".dotted-page-overlay" ).hide();

		$( element ).hide();

		var $overlay = $calendar.siblings( ".dotted-page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();

		//////////////////////////////////////////////////
		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.detach().prependTo( $calendar );
		$addEventContainer.find( "legend" ).text( "Dodaj do kalendarza" );

		var $addBtn = $addEventContainer.find( "#btnAddNewEvent" );
		$addBtn.find( "span" ).text( "Dodaj" );
		$addBtn.attr( "data-bind", "click: $root.addEventOnClick" )

		ko.unapplyBindings( $addBtn[0] );
		ko.applyBindings( self, $addBtn[0] );
		///////////////////////////////////////////////////

		var $eventTitle = $addEventContainer.find( "#Event_Title" );

		var dayNumber = $( element ).siblings( ".day" ).text();
		self.addNewEvent_Day( dayNumber );

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

		self.resetAndSetPrivacyLvlToObservableEvent( dayNumber, monthNumber, currYear, "private", 1 );

		var top = $( "#slide-item-calendar" ).parent().scrollTop();
		$addEventContainer.css( "top", top + 10 );
		$addEventContainer.show();
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

		self.resetAndSetPrivacyLvlToObservableEvent( day, month, self.todayDate.year, "public", 2 );

		var $lobby = $( "#lobby" );
		var $calendar = $( "#calendar" );
		var $details = $( "#details" );

		$lobby.siblings( ".dotted-page-overlay" ).hide();
		$calendar.siblings( ".dotted-page-overlay" ).hide();
		$details.siblings( ".dotted-page-overlay" ).hide();

		var $overlay = $lobby.siblings( ".dotted-page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();

		///////////////////////////////////////////////////
		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.detach().prependTo( "#lobby" );
		$addEventContainer.find( "legend" ).text( "Dodaj do tablicy wydarzeń" );

		var top = $( "#slide-item-lobby" ).parent().scrollTop();
		$addEventContainer.css( "top", top + 30 );

		var $addBtn = $addEventContainer.find( "#btnAddNewEvent" );
		$addBtn.find( "span" ).text( "Dodaj" );
		$addBtn.attr( "data-bind", "click: $root.addEventOnClick" )

		ko.unapplyBindings( $addBtn[0] );
		ko.applyBindings( self, $addBtn[0] );
		///////////////////////////////////////////////////

		$addEventContainer.show();
		var $eventTitle = $addEventContainer.find( "#Event_Title" ).focus();
	};

	self.showAddPrivateEventLobbyPopupOnClick = function ( element, data, e )
	{
		var day = self.todayDate.day < 10 ? '0' + self.todayDate.day : self.todayDate.day;
		var month = self.todayDate.month < 10 ? '0' + self.todayDate.month : self.todayDate.month;

		self.resetAndSetPrivacyLvlToObservableEvent( day, month, self.todayDate.year, "private", 1 );

		var $lobby = $( "#lobby" );
		var $calendar = $( "#calendar" );
		var $details = $( "#details" );

		$lobby.siblings( ".dotted-page-overlay" ).hide();
		$calendar.siblings( ".dotted-page-overlay" ).hide();
		$details.siblings( ".dotted-page-overlay" ).hide();

		var $overlay = $lobby.siblings( ".dotted-page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();

		//////////////////////////////////////////////////
		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.detach().prependTo( $calendar );
		$addEventContainer.find( "legend" ).text( "Dodaj do kalendarza" );

		var $addBtn = $addEventContainer.find( "#btnAddNewEvent" );
		$addBtn.find( "span" ).text( "Dodaj" );
		$addBtn.attr( "data-bind", "click: $root.addEventOnClick" )

		ko.unapplyBindings( $addBtn[0] );
		ko.applyBindings( self, $addBtn[0] );
		///////////////////////////////////////////////////


		var top = $( "#slide-item-lobby" ).parent().scrollTop();
		$addEventContainer.css( "top", top + 30 );
		$addEventContainer.show();
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
		//TODO: change so monthNum is from 1 - 12 (to make consistent throughout the app - lets agree that month values will be passed as values from 1 to 12).

		//monthNum is between 0 - 11

		var $calendar = $( "#calendar" );
		var $addNewEvent = $( "#addNewEventContainer" );
		var $loader = $calendar.siblings( ".dotted-page-overlay" );

		self.showLoader();

		$addNewEvent.detach();

		$calendar.find( ".month-name-header-container .current-month-name-calendar" ).removeClass( "current-month-name-calendar" );
		$calendar.find( ".month-name-header-container:eq( '" + monthNum + "' )" ).addClass( "current-month-name-calendar" );

		$calendar.calendarWidget( { month: monthNum, year: self.calendarPageDisplayDate.year() } );
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

		self.calendarPageDisplayDate.month( monthNum + 1 );

		for ( var i = -1; i < 2; i++ )
		{
			self.calendarPageMonthEvents = self.EVENT_MANAGER.getEventsForGivenMonth( self.calendarPageDisplayDate.year(), self.calendarPageDisplayDate.month() + i );

			//draw to calendar
			ko.utils.arrayForEach( self.calendarPageMonthEvents, function ( event )
			{
				self.drawEventToCalendar( event );
			} );
		}

		self.hideLoader( $loader );
	};

	self.redisplayCalendarAtChosenYear = function ( year )
	{
		self.calendarPageDisplayDate.year( year );
		self.redisplayCalendarAtChosenMonth( self.calendarPageDisplayDate.month() - 1 );
	};

	self.showEventBlockInfoOnDetailsPageEventRectangleClick = function ( id )
	{
		var $container = $( "#details #detailsEventsAndNotesContainer .details-event-block-container[data-eventid='" + id + "']" );
		var block = $container.find( ".details-event-block" )[0];
		self.showEventDetailsOnEventBlockClick( block );
	};

	self.closeAllSelectedEventsListContainerOnClick = function ()
	{
		var $menuItemContainer, $eventsMenuContainer;

		switch ( self.currentPage )
		{
			case 0:
				$( "#lobby #lobbyPageAllEventsListContainer" ).hide();

				$eventsMenuContainer = $( "#lobby .events-menu-container" );
				$eventsMenuContainer.find( ".menu-item-container" ).each( function ()
				{
					$menuItemContainer = $( this );

					if ( $menuItemContainer.hasClass( "selected" ) )
					{
						$menuItemContainer.removeClass( "selected" );
						$menuItemContainer.css( "top", "0px" );

						self.lobbyPageSelectedEvents.selectedKindValues = [];
						self.lobbyPageSelectedEvents.old( [] );
						self.lobbyPageSelectedEvents.upcoming( [] );
						self.lobbyPageSelectedEvents.settings.showOldEvents( false );
					}
				} );

				break;
			case 2:
				$( "#details #detailsPageAllEventsListContainer" ).hide();
				self.showDetailsPageClockContainer();


				$eventsMenuContainer = $( "#details .events-menu-container" );
				$eventsMenuContainer.find( ".menu-item-container" ).each( function ()
				{
					$menuItemContainer = $( this );

					if ( $menuItemContainer.hasClass( "selected" ) )
					{
						$menuItemContainer.removeClass( "selected" );
						$menuItemContainer.css( "top", "0px" );

						self.detailsPageSelectedEvents.selectedKindValues = [];
						self.detailsPageSelectedEvents.old( [] );
						self.detailsPageSelectedEvents.upcoming( [] );
						self.detailsPageSelectedEvents.settings.showOldEvents( false );
					}
				} );
				break;
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
				var fifthCheck = ( eEndH == aeStartH && eEndM > aeStartM ) || ( aeEndH == eStartH && ( aeStartM > eEndM || aeEndM > eStartM ) );

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

	self.showLoader = function ( $overlay )
	{
		var $target = $( "#spinnerContainer" );

		if ( $overlay )
		{
			if ( $overlay.css( "display" ) == "none" )
			{
				$overlay.show();
			}
		}

		//Get the window height and width
		var winH = $( window ).height();
		var winW = $( window ).width();

		//Set the popup window to center
		$target.css( 'top', winH / 2 - $target.height() / 2 );
		$target.css( 'left', winW / 2 - $target.width() / 2 );

		self.spinner.spin( $target[0] );
		$target.show();
	};

	self.hideLoader = function ( $overlay )
	{
		var $target = $( "#spinnerContainer" );

		if ( $overlay )
		{
			$overlay.fadeOut();
		}

		self.spinner.stop();
		$target.hide();
	};

	self.drawAnalogClock = function ()
	{
		var paper = Raphael( "clockCanvas", 200, 160 );
		//var clock = paper.circle(100,100,60);
		//clock.attr({"fill":"#000000"})  
		var hour_sign;
		for ( i = 0; i < 12; i++ )
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