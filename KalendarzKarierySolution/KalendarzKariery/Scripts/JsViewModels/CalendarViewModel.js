
function CalendarViewModel( year, month, day, weekday, userName, spinner )
{
	var self = this;
	var colorHelper = new EventColorHelper();
	var date = new Date();

	//////////////////////////////////////////////////////////
	//public properties
	//////////////////////////////////////////////////////////

	//ajax loader 
	self.spinner = spinner;

	self.todayDate = {
		"day": date.getDate(),
		"month": date.getMonth(),
		"year": date.getFullYear(),
		"weekday": date.getDay(),
		"getMonthName": function ()
		{
			return self.monthNames[this.month];
		},
		"getDayName": function ()
		{
			return this.weekday == 0 ? self.dayNames[6] : self.dayNames[this.weekday - 1];
		},
		"javaScriptStartDate": date
	}

	self.monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
	self.dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
	self.userName = userName ? userName : '';

	self.eventKinds = [];
	self.eventPrivacyLevels = [];

	//is used when adding or editing event
	self.observableEvent = new KKEventModelObservable();

	// month starts from 1 to 12
	self.detailsPageDisplayDate = {
		"year": ko.observable( year ),
		"month": ko.observable( month ),
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

	self.detailsPageEventMostBottomRow = 1;

	//month starts from 1 to 12
	self.calendarPageDisplayDate = {
		"year": ko.observable( year ),
		"month": ko.observable( month )
	};

	self.addNewEvent_Day = ko.observable( 0 );

	self.calendarDayEventsToUpdate = {
		"day": 0,
		"events": null
	}

	self.calendarPageMonthEvents = [];
	self.detailsPageDayEvents = ko.observableArray( [] );

	//TODO: change into event tree with arrays grouped by event kind
	self.detailsPageSelectedEvents = {
		"old": ko.observableArray( [] ),
		"upcoming": ko.observableArray( [] ),
		"settings": {
			"showOldEvents" : ko.observable(true)
		}
	}

	//TODO: change into event tree with arrays grouped by event kind
	self.lobbyPageSelectedEvents = ko.observableArray( [] );

	self.newsEvents = [];

	//it is filled with public events when building publicEventTree
	self.publicEvents = [];
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
	self.publicEventTreeCountBasedOnEventKind = {
		// example
		//
		//"1": {
		//	"upcoming": ko.observable(10),
		//	"old" : ko.observable(20)
		//},
		//"2": {
		//	"upcoming": ko.observable(10),
		//	"old" : ko.observable(20)
		//},
	};

	self.myEventTreeCountBasedOnEventKind = {
		// example
		//
		//"1": {
		//	"upcoming": ko.observable(10),
		//	"old" : ko.observable(20)
		//},
		//"2": {
		//	"upcoming": ko.observable(10),
		//	"old" : ko.observable(20)
		//},
	};

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

	//////////////////////////////////////////////////////////
	// METHODS 
	//////////////////////////////////////////////////////////

	self.getEventByDateAndId = function ( id, year, month, day )
	{
		var yearProp = self.myEventTree[year], monthProp, daysProp, event;
		if ( yearProp )
		{
			monthProp = yearProp[month];
			if ( monthProp )
			{
				for ( var i in monthProp )
				{
					daysProp = monthProp[i];
					for ( var j in daysProp )
					{
						event = daysProp[j];

						if ( event.id == id )
						{

							return event;
						}
					}
				}
			}
		}

		return null;
	}

	self.getEventsForGivenMonth = function ( month, year )
	{
		var yearProp = self.myEventTree[year], monthProp, daysProp, events = [];
		if ( yearProp )
		{
			monthProp = yearProp[month];
			if ( monthProp )
			{
				for ( var i in monthProp )
				{
					daysProp = monthProp[i];
					for ( var j in daysProp )
					{
						events.push( daysProp[j] );
					}
				}
			}
		}

		return events;

		//return ko.utils.arrayFilter(events, function (item) {
		//	return item.startDate.month == month && item.startDate.year == year;
		//});
	};

	self.getEventsForGivenDay = function ( day )
	{
		var yearProp = self.myEventTree[self.detailsPageDisplayDate.year()], monthProp, daysProp, events = [];
		if ( yearProp )
		{
			monthProp = yearProp[parseInt( self.detailsPageDisplayDate.month(), 10 )];
			if ( monthProp )
			{
				var daysProp = monthProp[self.detailsPageDisplayDate.day()];
				if ( daysProp )
				{
					return daysProp;
				}
			}
		}

		return [];
	};

	self.addEventOnClick = function ()
	{
		var $loader;
		var $addEventForm = $( "#addEventForm" );

		var privacyLvlValue = self.observableEvent.privacyLevel.value;
		var eventKindValue = self.observableEvent.kind.value();

		var action = $addEventForm.attr( "action" );

		var day = $( "#eventStartDayTxtBox" ).val();
		var month = $( "#eventStartMonthTxtBox" ).val();
		var year = $( "#eventStartYearTxtBox" ).val();

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
			var startHour = $( "#startHourSelectBox" ).val();
			var endHour = $( "#endHourSelectBox" ).val();
			var startMinute = $( "#startMinuteSelectBox" ).val();
			var endMinute = $( "#endMinuteSelectBox" ).val();

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

			var startDateJson = startEventDate.toJSON();
			var endDateJson = endEventDate.toJSON();

			var diff = Math.abs( startEventDate - endEventDate );
			var minutes = Math.floor(( diff / 1000 ) / 60 );

			$loader = $addEventForm.closest( ".main-section" ).siblings( ".dotted-page-overlay" );

			$.ajax( {
				url: action,
				dataType: "JSON",
				type: "POST",
				beforeSend: function () { self.showLoader( $loader ); $( "#addNewEventContainer" ).hide(); },
				data: $addEventForm.serialize() +
				"&Event.StartDate=" + startDateJson +
				"&Event.EndDate=" + endDateJson +
				"&PrivacyLevel.Value=" + privacyLvlValue +
				"&EventKind.Value=" + eventKindValue,
				success: function ( result )
				{
					if ( result.IsSuccess === false )
					{
						self.hideLoader();
						$( "#addNewEventContainer" ).show();
						//TODO: change alert to some error popop or error page...
						alert( result.Message );

					} else
					{
						var eventFactory = new EventFactory();
						var eventToPush = eventFactory.getKKEventModel(
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
						new KKEventDateModel( startEventDate, startMinute, endMinute, startHour, endHour, day, month, year ),
						self.observableEvent.name(),
						self.observableEvent.urlLink(),
						self.observableEvent.price()
						);

						var dayEvents = self.addEventToMyEventTree( eventToPush );

						self.setCalendarPlacementRow( dayEvents );
						self.redrawCalendarCell( dayEvents, self.addNewEvent_Day() );

						//$addEventForm[0].reset();
						self.hideLoader( $loader );
					}
				},
				error: function ()
				{
					alert( "Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz." );
					self.hideLoader( $loader );
					$( "#addNewEventContainer" ).show();
				}
			} );
		}

		return false;
	};

	self.prepareDeleteEventDetailsPageOnDeleteLinkClick = function ( id, year, month, day )
	{

		var $popup = $( "#details" ).siblings( ".confirmation-popupbox-container" );
		var $yesBtn = $popup.find( ".confirmation-popupbox-yesbtn" );
		$yesBtn.attr( "data-bind", "click: function () { $root.deleteEventDetailsPageOnConfirmationYesBtnClick($element, " + id + "," + year + "," + month + "," + day + ") }" );

		self.showConfirmationPopupBox( $popup, "Czy napewno chcesz usunąć wybrane wydarzenie?" );

		ko.unapplyBindings( $yesBtn[0] );
		ko.applyBindings( self, $yesBtn[0] );
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
		$addEventContainer.find( "legend" ).text( "Edytuj" );
		$addEventContainer.find( "#btnAddNewEvent" ).attr( "data-privacylvl", 1 );

		var event = self.getEventByDateAndId( id, year, month, day );

		self.observableEvent.name( event.name );

		self.observableEvent.addedBy( event.addedBy );

		self.observableEvent.address.street( event.address.street );
		self.observableEvent.address.city( event.address.city );
		self.observableEvent.address.zipCode( event.address.zipCode );

		var date = new Date();
		self.observableEvent.dateAdded = event.dateAdded;

		self.observableEvent.description( event.description );
		self.observableEvent.details( event.details );
		self.observableEvent.eventLengthInMinutes = event.eventLengthInMinutes;

		var colorHelper = new EventColorHelper();

		self.observableEvent.kind.value( event.kind.value );
		self.observableEvent.kind.name( event.kind.name );
		self.observableEvent.kind.color = colorHelper.calculatePrivateEventColor( self.observableEvent.kind.value );
		self.observableEvent.kind.headerColor = colorHelper.calculateEventHeaderTxtColor( self.observableEvent.kind.value );
		self.observableEvent.kind.detailsPageEventBorderColor = colorHelper.calculateEventDetailsBorderColor( self.observableEvent.kind.value );

		self.observableEvent.id = event.id;

		self.observableEvent.occupancyLimit( event.occupancyLimit );

		self.observableEvent.privacyLevel.name = event.privacyLevel.name;
		self.observableEvent.privacyLevel.value = event.privacyLevel.value;

		self.observableEvent.startDate = event.startDate;

		self.observableEvent.urlLink( event.urlLink );
		self.observableEvent.price( event.price );

		var docScroll = $( "#slide-item-details" ).parent().scrollTop();
		$addEventContainer.css( "top", docScroll + 30 );
		$addEventContainer.show();
		$addEventContainer.find( "#Event_Title" ).focus();
	};

	self.deleteEventDetailsPageOnConfirmationYesBtnClick = function ( element, id, year, month, day )
	{
		var $loader = $( "#details" ).siblings( ".dotted-page-overlay" );
		var events;
		$.ajax( {
			url: "/api/Events/" + id,
			dataType: "JSON",
			type: "DELETE",
			beforeSend: function () { self.hideConfirmationPopupBox( element ); self.showLoader( $loader ); },
			data: id,
			success: function ( result )
			{
				if ( result.IsSuccess === false )
				{

					self.hideLoader( $loader );

					//TODO: change alert to some error popop or error page...
					alert( result.Message );
				} else
				{
					self.hideLoader( $loader );
					var $container = $( "#details #detailsEventBlockList .event-block-container .hidden-event-id:contains(" + id + ")" ).parent();

					$container.fadeOut( 500, function ()
					{
						$container.remove();

						self.detailsPageDayEvents.remove( function ( event )
						{
							return event.id === id;
						} );

						self.removeEventFromMyEventTree( id, year, month, day );

						var $scrollable = $( "#slide-item-details" ).parent();
						var scroll = $( "#details #calendarDayDetailsContainer" ).position().top - 20;
						$scrollable.scrollTop( scroll );

						//redraw details page event rectangle table
						self.removeEventRectanglesFromDetailsDay();
						events = self.detailsPageDayEvents();

						self.setCalendarPlacementRow( events );
						self.displayPageEventMostBottomRow = 1;

						for ( var i in events )
						{
							self.drawEventToDetailsDayTable( events[i] );
						}

						var $tableBody = $( "#calendarDayDetailsTable .table-details-body" );
						var h = ( self.displayPageEventMostBottomRow + 1 ) * 46;
						$tableBody.height( h + "px" );

						//for calendar to redraw events in day cell
						self.calendarDayEventsToUpdate.day = self.detailsPageDisplayDate.day();
						self.calendarDayEventsToUpdate.events = events;
					} );
				}
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz." );
				self.hideLoader( $loader );
				self.hideConfirmationPopupBox( element );
			}
		} );
	};

	self.redrawCalendarCell = function ( dayEvents, day )
	{

		//remove events from calendar cell
		var cellDay = ".day" + day;
		var $cellPlaceholder = $( "#calendar" ).find( cellDay ).find( ".calendar-cell-placeholder" );
		$cellPlaceholder.find( ".event-rectangle" ).remove();
		//

		for ( var i in dayEvents )
		{
			self.drawEventToCalendar( dayEvents[i] );
		}
	}

	self.removeEventFromMyEventTree = function ( id, year, month, day )
	{
		var eventTree = self.myEventTree;
		var eventTreeYearProp, eventTreeMonthProp, dayEvents, event;
		var old, upcoming, eventCount, today, endDate;
		var array;

		if ( self.myEventTree[year] )
		{
			eventTreeYearProp = self.myEventTree[year];
			if ( eventTreeYearProp[month] )
			{
				eventTreeMonthProp = eventTreeYearProp[month];
				if ( eventTreeMonthProp[day] )
				{
					dayEvents = eventTreeMonthProp[day];

					for ( var i in dayEvents )
					{
						event = dayEvents[i];

						if ( event.id === id )
						{
							dayEvents.pop( event );

							//remove from detailsPageSelectedEvents
							array = ko.utils.arrayFilter( self.detailsPageSelectedEvents(), function ( item )
							{
								return item.id != event.id;
							} );
							self.detailsPageSelectedEvents( array );

							//remove from self.myEventTreeCountBasedOnEventKind
							// TODO: make count a calculated observable so we don't have to update count value manually
							eventCount = self.myEventTreeCountBasedOnEventKind[event.kind.value];
							if ( eventCount )
							{
								old = eventCount.events.old();
								upcoming = eventCount.events.upcoming();

								today = new Date();
								endDate = new Date( event.startDate.year, event.startDate.month - 1, event.startDate.day, event.startDate.endHour, event.startDate.endMinute, 0, 0 );

								if ( today > endDate )
								{
									eventCount.events.old( old - 1 );
								} else
								{
									eventCount.events.upcoming( upcoming - 1 );
								}
							}

							return;
						}
					}
				}
			}
		}

	};

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

	self.showEventDetailsOnEventBlockClick = function ( element )
	{
		var $block = $( element );
		var $eventBlockContainer = $block.closest( ".event-block-container" );
		var offset = $eventBlockContainer.position().top;

		$eventBlockContainer.closest( ".scrollable" ).scrollTop( offset );

		var $content = $eventBlockContainer.find( ".event-block-content" );

		var $eventBlockInfo = $eventBlockContainer.find( ".event-block-info-container" );

		if ( $block.hasClass( "open" ) )
		{
			$eventBlockInfo.slideUp();
			$content.css( "color", "rgb(229, 211, 180)" );
		}
		else
		{
			$eventBlockInfo.slideDown();
			$content.css( "color", "rgb(161, 147, 123)" );
		}

		$block.toggleClass( "open" );
	};

	self.toggleShowOldEventsOnCheckboxClick = function ( element )
	{
		var $chkbox = $( element ).find( "#showOldEventsCheckbox" );

		if ( self.detailsPageSelectedEvents.settings.showOldEvents() )
		{
			self.detailsPageSelectedEvents.settings.showOldEvents( false );
			self.detailsPageSelectedEvents.old([]);
			$chkbox.empty();
		}
		else
		{
			self.detailsPageSelectedEvents.settings.showOldEvents( true );
			$chkbox.text("✓");
		}
	};

	self.addEventToMyEventTree = function ( newEvent )
	{
		var year = newEvent.startDate.year;
		var month = newEvent.startDate.month;
		var day = newEvent.startDate.day;

		var eventTreeYearProp = self.myEventTree[year] ? self.myEventTree[year] : self.myEventTree[year] = {};
		var eventTreeMonthProp = eventTreeYearProp[month] ? eventTreeYearProp[month] : eventTreeYearProp[month] = {};
		var dayEvents = eventTreeMonthProp[day] ? eventTreeMonthProp[day] : eventTreeMonthProp[day] = [];

		dayEvents.push( newEvent );

		//add to self.myEventTreeCountBasedOnEventKind
		// TODO: make count a calculated observable so we don't have to update count value manually
		var eventCount = self.myEventTreeCountBasedOnEventKind[newEvent.kind.value];
		if ( eventCount )
		{
			old = eventCount.events.old();
			upcoming = eventCount.events.upcoming();

			today = new Date();
			endDate = new Date( newEvent.startDate.year, newEvent.startDate.month - 1, newEvent.startDate.day, newEvent.startDate.endHour, newEvent.startDate.endMinute, 0, 0 );

			if ( today > endDate )
			{
				eventCount.events.old( old + 1 );
			} else
			{
				eventCount.events.upcoming( upcoming + 1 );
			}
		}

		return dayEvents;
	};

	self.getFilteredEventsFromEventTree = function ( eventTree, eventPropNameArray, value, oldUpcomingOrAny )
	{
		var arr = [], daysArr, event, yearNode, monthNode, dayNode, prop;
		var parsedYear, parsedMonth, parsedDay;
		var isCurrentYear = false, isCurrentMonth = false, isCurrentDay = false;
		var date = new Date();

		if (typeof oldUpcomingOrAny == 'undefined')
		{
			oldUpcomingOrAny = "all";
		}

		switch ( oldUpcomingOrAny )
		{
			case "old":
				for ( var year in eventTree )
				{
					parsedYear = parseInt( year, 10 );

					if ( parsedYear > date.getFullYear() )
					{
						continue;
					}

					isCurrentYear = ( parsedYear == date.getFullYear() );
					yearNode = eventTree[year];

					for ( var month in yearNode )
					{
						parsedMonth = parseInt(month, 10);

						if (isCurrentYear && parsedMonth > (date.getMonth() + 1))
						{
							continue;
						}

						isCurrentMonth = ( parsedMonth == date.getMonth() + 1 );
						monthNode = yearNode[month];

						for ( day in monthNode )
						{
							parsedDay = parseInt(day, 10);

							if (isCurrentYear && isCurrentMonth && parsedDay > date.getDate() )
							{
								continue;
							}

							isCurrentDay = (parsedDay == date.getDate());
							daysArr = monthNode[day];

							for ( var i = 0; i < daysArr.length; i++ )
							{
								event = daysArr[i];
								prop = event;

								if (isCurrentYear && isCurrentMonth && isCurrentDay && ( event.startDate.endHour > date.getHours() || (event.startDate.endHour == date.getHours() && event.startDate.endMinute > date.getMinutes())))
								{
									continue;
								}

								for ( var j = 0; j < eventPropNameArray.length; j++ )
								{
									prop = prop[eventPropNameArray[j]];
								}

								if ( prop === value )
								{
									arr.push( event );
								}
							}
						}
					}
				}
				return arr;
			case "upcoming":
				for ( var year in eventTree )
				{
					parsedYear = parseInt( year, 10 );

					if ( parsedYear < date.getFullYear() )
					{
						continue;
					}

					isCurrentYear = ( parsedYear == date.getFullYear() );
					yearNode = eventTree[year];

					for ( var month in yearNode )
					{
						parsedMonth = parseInt( month, 10 );

						if (isCurrentYear && parsedMonth < ( date.getMonth() + 1 ) )
						{
							continue;
						}

						isCurrentMonth = ( parsedMonth == date.getMonth() + 1 );
						monthNode = yearNode[month];

						for ( day in monthNode )
						{

							parsedDay = parseInt( day, 10 );

							if ( isCurrentYear && isCurrentMonth && parsedDay < date.getDate() )
							{
								continue;
							}

							isCurrentDay = ( parsedDay == date.getDate() );
							daysArr = monthNode[day];

							for ( var i = 0; i < daysArr.length; i++ )
							{
								event = daysArr[i];
								prop = event;

								if ( isCurrentYear && isCurrentMonth && isCurrentDay && ( event.startDate.endHour <= date.getHours() || ( event.startDate.endHour == date.getHours() && event.startDate.endMinute <= date.getMinutes() ) ) )
								{
									continue;
								}

								for ( var j = 0; j < eventPropNameArray.length; j++ )
								{
									prop = prop[eventPropNameArray[j]];
								}

								if ( prop === value )
								{
									arr.push( event );
								}
							}
						}
					}
				}
				return arr;
			case "all":
				for ( var year in eventTree )
				{
					yearNode = eventTree[year];
					for ( var month in yearNode )
					{
						monthNode = yearNode[month];
						for ( day in monthNode )
						{
							daysArr = monthNode[day];

							for ( var i = 0; i < daysArr.length; i++ )
							{
								event = daysArr[i];
								prop = event;

								for ( var j = 0; j < eventPropNameArray.length; j++ )
								{
									prop = prop[eventPropNameArray[j]];
								}

								if ( prop === value )
								{
									arr.push( event );
								}
							}
						}
					}
				}
				return arr;
			default: return arr;
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

		$event.css( "opacity", .8 );

		$cellPlaceholder.append( $event );
	};

	self.drawEventToDetailsDayTable = function ( event, onAppInit )
	{

		//set detailsPageBottomRow to calculate detailsPageEventsTable height based on the most bottom event.calendarPlacementRow 
		if ( event.calendarPlacementRow > self.displayPageEventMostBottomRow )
		{
			self.displayPageEventMostBottomRow = event.calendarPlacementRow;
		}

		var startMinuteOffset = event.startDate.startMinute / 60 * 100;
		var endMinuteOffset = event.startDate.endMinute / 60 * 100;
		var width = ( ( event.startDate.endHour - event.startDate.startHour ) * 100 ) - startMinuteOffset + endMinuteOffset;

		var $hourCell = $( ".hour-cell-" + event.startDate.startHour );
		var eventRectangle = '<div data-bind="click: function(){ $root.showEventBlockInfoOnDetailsPageEventRectangleClick(' + event.id + ') }" class="event-rectangle-details" style="width:' + ( width - 6 ) + '%;top : ' + ( ( ( event.calendarPlacementRow - 1 ) * 46 ) + 12 ) + 'px;left:' + ( startMinuteOffset + 1 ) + '%;border-color:' + event.kind.detailsPageEventBorderColor + ';"><span>' + event.name + '</span></div>';
		var $eventRectangle = $( eventRectangle );

		$eventRectangle.appendTo( $hourCell );
		$eventRectangle.parent();

		ko.unapplyBindings( $eventRectangle[0] );
		ko.applyBindings( self, $eventRectangle[0] );
	};

	self.removeEventRectanglesFromDetailsDay = function ()
	{
		var $detailsTable = $( "#details #calendarDayDetailsTable" );
		$detailsTable.find( ".event-rectangle-details" ).remove();
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

		self.removeEventRectanglesFromDetailsDay();

		var events = self.getEventsForGivenDay( dayInt )
		self.detailsPageDayEvents( events );

		for ( var i in events )
		{
			self.drawEventToDetailsDayTable( events[i] );
		}

		var $tableBody = $( "#calendarDayDetailsTable .table-details-body" );
		var h = ( self.displayPageEventMostBottomRow + 1 ) * 46;
		$tableBody.height( h + "px" );

		var $scrollable = $( "#slide-item-details" ).parent();
		var scroll;

		window.location = "#2";
		setTimeout( function ()
		{
			scroll = $( "#details #calendarDayDetailsContainer" ).position().top - 20;
			$scrollable.scrollTop( scroll );
		}, 10 )
	};

	self.showSelectedEventsOnMenuItemClick = function ( element )
	{
		var $clock = $( "#details #clockCanvas" );
		var $menuItem = $( element ).find( ".menu-item" );

		var eventKindValue = $menuItem.attr( "data-eventkind" );
		var eventPrivacyLevelName = $menuItem.attr( "data-privacylvl" );

		var $menuItemContainer = $menuItem.closest( ".menu-item-container" );
		$menuItemContainer.toggleClass( "selected" );

		if ( $menuItemContainer.hasClass( "selected" ) )
		{
			$menuItemContainer.css( "top", "20px" );
			$menuItemContainer.css( "background", "rgb(239, 232, 208)" );
			showSelectedEvents();
		} else
		{
			$menuItemContainer.css( "top", "0px" );
			$menuItemContainer.css( "background", "rgb(223, 215, 188)" );
			removeSelectedEvents();		
		}

		function showSelectedEvents()
		{
			var combinedArray = [], combinedArray2 = [], arr, arr2, shownEvents;

			//TODO: change check from privacyLvlName to privacyLvl
			if ( eventPrivacyLevelName == "private" )
			{
				arr = self.getFilteredEventsFromEventTree( self.myEventTree, ["kind", "value"], parseInt( eventKindValue, 10 ), "upcoming" );
				shownEvents = self.detailsPageSelectedEvents.upcoming();

				if ( shownEvents.length )
				{
					combinedArray = arr.concat( shownEvents );
					combinedArray.sort( function ( a, b )
					{
						return ( a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate );
					} );

					self.detailsPageSelectedEvents.upcoming( combinedArray );
				} else
				{
					self.detailsPageSelectedEvents.upcoming( arr );

					$( "#details #detailsPageAllEventsListContainer" ).show();
					$clock.hide();
				}

				if ( self.detailsPageSelectedEvents.settings.showOldEvents())
				{
					arr2 = self.getFilteredEventsFromEventTree( self.myEventTree, ["kind", "value"], parseInt( eventKindValue, 10 ), "old" );
					shownEvents = self.detailsPageSelectedEvents.old();

					if ( shownEvents.length )
					{
						combinedArray2 = arr2.concat( shownEvents );
						combinedArray2.sort( function ( a, b )
						{
							return ( a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate );
						} );

						self.detailsPageSelectedEvents.old( combinedArray2 );
					} else
					{
						self.detailsPageSelectedEvents.old( arr2 );
					}
				}


			} else
			{
				$( "#lobby #lobbyPageAllEventsListContainer" ).show();
				arr = self.getFilteredEventsFromEventTree( self.publicEventTree, ["kind", "value"], parseInt( eventKindValue, 10 ));
				shownEvents = self.lobbyPageSelectedEvents();

				if ( shownEvents.length )
				{
					combinedArray = arr.concat( shownEvents );
					combinedArray.sort( function ( a, b )
					{
						return ( a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate );
					} );

					self.lobbyPageSelectedEvents( combinedArray );
				} else
				{
					self.lobbyPageSelectedEvents( arr );
				}
			}
		}
		function removeSelectedEvents()
		{
			var array, array2;

			//TODO: change check from privacyLvlName to privacyLvl
			if ( eventPrivacyLevelName === "private" )
			{
				array = ko.utils.arrayFilter( self.detailsPageSelectedEvents.upcoming(), function ( item )
				{
					return item.kind.value != eventKindValue;
				} );

				//array.sort(function (a, b) {
				//	return (a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate);
				//});

				self.detailsPageSelectedEvents.upcoming( array );

				if ( self.detailsPageSelectedEvents.settings.showOldEvents() )
				{
					array2 = ko.utils.arrayFilter( self.detailsPageSelectedEvents.old(), function ( item )
					{
						return item.kind.value != eventKindValue;
					} );

					self.detailsPageSelectedEvents.old( array2 );
				}

				if ( !$( "#details #detailsPanel .menu-item-container" ).hasClass( "selected" ) )
				{
					$( "#details #detailsPanel #detailsPageAllEventsListContainer" ).hide();
					$clock.fadeIn();
				}
			} else
			{
				array = ko.utils.arrayFilter( self.lobbyPageSelectedEvents(), function ( item )
				{
					return item.kind.value != eventKindValue;
				} );

				//array.sort(function (a, b) {
				//	return (a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate);
				//});

				self.lobbyPageSelectedEvents( array );

				if ( !$( "#lobby #lobbyEventsMenuContainer .menu-item-container" ).hasClass( "selected" ) )
				{
					$( "#lobby #lobbyPageAllEventsListContainer" ).hide();
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
		$cont.find( "#addEventForm" )[0].reset();

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
		//TODO: change into binding
		self.observableEvent.privacyLevel.name = "private";
		self.observableEvent.privacyLevel.value = 1;

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

		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.detach().prependTo( $calendar );
		$addEventContainer.find( "legend" ).text( "Dodaj do kalendarza" );
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

		$addEventContainer.find( "#eventStartDayTxtBox" ).val( dayNumber );
		$addEventContainer.find( "#eventStartMonthTxtBox" ).val( monthNumber );
		$addEventContainer.find( "#eventStartYearTxtBox" ).val( currYear );

		$addEventContainer.show();
		$eventTitle.focus();

		var top = $addEventContainer.position().top;
		$( "#slide-item-calendar" ).parent().scrollTop( top );

		if ( e )
		{
			e.stopPropagation();
		}
	};

	self.showAddPublicEventPopupOnClick = function ( element, data, e )
	{
		//TODO: change into binding
		self.observableEvent.privacyLevel.name = "public";
		self.observableEvent.privacyLevel.value = 2;

		var $lobby = $( "#lobby" );
		var $calendar = $( "#calendar" );
		var $details = $( "#details" );

		$lobby.siblings( ".dotted-page-overlay" ).hide();
		$calendar.siblings( ".dotted-page-overlay" ).hide();
		$details.siblings( ".dotted-page-overlay" ).hide();

		var $overlay = $lobby.siblings( ".dotted-page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();

		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.detach().prependTo( "#lobby" );

		$addEventContainer.find( "legend" ).text( "Dodaj do tablicy wydarzeń" );
		$addEventContainer.show();
		var $eventTitle = $addEventContainer.find( "#Event_Title" ).focus();

		var top = $addEventContainer.position().top;
		$( "#slide-item-lobby" ).parent().scrollTop( top );
	};

	self.showAddPrivateEventLobbyPopupOnClick = function ( element, data, e )
	{
		//TODO: change into binding
		self.observableEvent.privacyLevel.name = "private";
		self.observableEvent.privacyLevel.value = 1;

		var $lobby = $( "#lobby" );
		var $calendar = $( "#calendar" );
		var $details = $( "#details" );

		$lobby.siblings( ".dotted-page-overlay" ).hide();
		$calendar.siblings( ".dotted-page-overlay" ).hide();
		$details.siblings( ".dotted-page-overlay" ).hide();

		var $overlay = $lobby.siblings( ".dotted-page-overlay" );
		$overlay.css( "opacity", 1 );
		$overlay.show();

		var $addEventContainer = $( "#addNewEventContainer" );
		$addEventContainer.detach().prependTo( $lobby );
		$addEventContainer.find( "legend" ).text( "Dodaj do kalendarza" );
		$addEventContainer.show();
		$addEventContainer.find( "#Event_Title" ).focus();
		var top = $addEventContainer.position().top + 30;
		$( "#slide-item-lobby" ).parent().scrollTop( top );
	};

	self.redisplayCalendarAtChosenMonth = function ( monthNum )
	{
		//monthNum is between 0 - 11
		var $calendar = $( "#calendar" );
		var $addNewEvent = $( "#addNewEventContainer" );
		var $loader = $calendar.siblings( ".dotted-page-overlay" );

		self.showLoader();

		$addNewEvent.detach();

		$calendar.find(".month-name-header-container .current-month-name-calendar").removeClass( "current-month-name-calendar" );
		$calendar.find(".month-name-header-container:eq( '" + monthNum  + "' )" ).addClass( "current-month-name-calendar" );

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
			self.calendarPageMonthEvents = self.getEventsForGivenMonth( self.calendarPageDisplayDate.month() + i, self.calendarPageDisplayDate.year() );

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
	}

	self.showChosenFieldInAddNewEventPopupOnClick = function ( element )
	{
		var $element = $( element );
		$element.next().show();
		$element.next().find( "input, textarea" ).first().focus();
		$element.hide();
	};

	self.showEventBlockInfoOnDetailsPageEventRectangleClick = function ( id )
	{
	//TODO: maybe remove hidden-event-id and use data- attribute instead
		var $container = $( "#details #detailsEventBlockList .event-block-container .hidden-event-id:contains(" + id + ")" ).parent();
		var block = $container.find( ".event-block" )[0];
		self.showEventDetailsOnEventBlockClick( block );
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
	}

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
	}

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
}