var EventManager = function ( appViewModel )
{
	var self = this;

	self.resetKKEventModelObservable = function ( ev, day, month, year )
	{
		ev.addedBy( "" );

		ev.address.street( "" );
		ev.address.city( "" );
		ev.address.zipCode( "" );

		ev.dateAdded.minute = 0;
		ev.dateAdded.hour = 0;
		ev.dateAdded.day = 0;
		ev.dateAdded.month = 0;
		ev.dateAdded.year = 0;

		ev.description( "" );
		ev.details( "" );

		ev.kind.value( "1" );
		ev.kind.value( "Wydarzenie" );
		ev.kind.color = "";
		ev.kind.headerColor = "";
		ev.kind.detailsPageEventBorderColor = "";

		ev.id = 0;

		ev.isEventAddedToCurrentUserCalendar = false;
		ev.isCurrentUserSignedUpForEvent = false;

		ev.name( "" );

		ev.numberOfPeopleAttending( 0 );

		ev.occupancyLimit( "" );

		ev.privacyLevel.name = "";
		ev.privacyLevel.value = "";

		ev.price( 0 );

		var now = new Date();
		var startM = now.getMinutes(), endM;
		var startH = now.getHours(), endH;

		if ( startM < 49 && startH < 20 || startM < 49 && startH == 20 )
		{
			// example: 7:20
			endM = startM + 10;
			endH = startH;
		}
		else if ( startM > 49 && startH < 20 )
		{
			// example: 19:58
			endM = startM % 10;
			endH = startH + 1;
		}
		else
		{
			startH = 7;
			startM = 0;
			endH = 7;
			endM = 10;
		}

		ev.startDate.startMinute( startM );
		ev.startDate.endMinute( endM );
		ev.startDate.startHour( startH );
		ev.startDate.endHour( endH );
		ev.startDate.day( day );
		ev.startDate.month( month );
		ev.startDate.year( year );

		ev.urlLink( "" );
	};

	self.getNewKKEventModel = function ( addedBy, street, city, zipCode, description, details, minutes, kindValue, kindName, eventId, occupancyLimit, privacyLevelName, privacyLevelValue, startDate, name, urlLink, price, dateAdded, isEventAddedToCurrentUserCalendar, isCurrentUserSignedUpForEvent, eventStatus )
	{
		var colorHelper = appViewModel.UTILS.colorHelper;

		var kkEventModel = new KKEventModel();

		kkEventModel.addedBy = replaceWithNull( addedBy );
		kkEventModel.address.street = replaceWithNull( street );
		kkEventModel.address.city = replaceWithNull( city );
		kkEventModel.address.zipCode = replaceWithNull( zipCode );

		if ( dateAdded instanceof KKDateModel )
		{
			kkEventModel.dateAdded = dateAdded;
		}
		else
		{
			kkEventModel.dateAdded = new KKDateModel( dateAdded.minute, dateAdded.hour, dateAdded.day, dateAdded.month, dateAdded.year );
		}

		kkEventModel.description = replaceWithNull( description );
		kkEventModel.details = replaceWithNull( details );
		kkEventModel.eventLengthInMinutes = minutes;

		kkEventModel.kind.value = kindValue;
		kkEventModel.kind.name = kindName.toUpperCase();
		kkEventModel.kind.color = colorHelper.getEventColor( privacyLevelValue, kkEventModel.kind.value );
		kkEventModel.kind.headerColor = colorHelper.getEventBoxHeaderColor( kkEventModel.kind.value );
		kkEventModel.kind.detailsPageEventBorderColor = colorHelper.getEventDetailsBorderColor( kkEventModel.kind.value );

		kkEventModel.id = replaceWithNull( eventId );
		kkEventModel.occupancyLimit = replaceWithNull( occupancyLimit );
		kkEventModel.privacyLevel.name = privacyLevelName;
		kkEventModel.privacyLevel.value = privacyLevelValue;
		kkEventModel.startDate = startDate;
		kkEventModel.name = name;
		kkEventModel.urlLink = replaceWithNull( urlLink );
		kkEventModel.price = replaceWithNull( price );
		kkEventModel.isEventAddedToCurrentUserCalendar = ko.observable( isEventAddedToCurrentUserCalendar );
		kkEventModel.isCurrentUserSignedUpForEvent = ko.observable( isCurrentUserSignedUpForEvent );
		kkEventModel.status = eventStatus;

		return kkEventModel;

		function replaceWithNull( value )
		{
			if ( value === '' || value === undefined || value === 0 )
			{
				return null;
			}
			return value;
		}
	}

	self.getEventByDateAndId = function ( id, year, month, day, eventTree )
	{
		var yearProp = eventTree[year], monthProp, daysProp, event;
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

	self.getEventsForGivenDay = function ( year, month, day, eventTree )
	{
		var yearProp = eventTree[year], monthProp, daysProp;
		if ( yearProp )
		{
			monthProp = yearProp[month];
			if ( monthProp )
			{
				var daysProp = monthProp[day];
				if ( daysProp )
				{
					return daysProp;
				}
			}
		}

		return [];
	};

	self.getEventsForGivenMonth = function ( year, month, eventTree )
	{
		var yearProp = eventTree[year], monthProp, daysProp, events = [];
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

	self.getEventsByPropertyValue = function ( eventTree, checkArgs, oldUpcomingOrAll )
	{
		var arr = [], daysArr, event, yearNode, monthNode, dayNode, prop;
		var parsedYear, parsedMonth, parsedDay;
		var isCurrentYear = false, isCurrentMonth = false, isCurrentDay = false;
		var date = new Date();

		if ( typeof oldUpcomingOrAll == 'undefined' )
		{
			oldUpcomingOrAll = "all";
		}

		switch ( oldUpcomingOrAll )
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
						parsedMonth = parseInt( month, 10 );

						if ( isCurrentYear && parsedMonth > ( date.getMonth() + 1 ) )
						{
							continue;
						}

						isCurrentMonth = ( parsedMonth == ( date.getMonth() + 1 ) );
						monthNode = yearNode[month];

						for ( day in monthNode )
						{
							parsedDay = parseInt( day, 10 );

							if ( isCurrentYear && isCurrentMonth && parsedDay > date.getDate() )
							{
								continue;
							}

							isCurrentDay = ( parsedDay == date.getDate() );
							daysArr = monthNode[day];

							for ( var i = 0; i < daysArr.length; i++ )
							{
								event = daysArr[i];

								if ( isCurrentYear && isCurrentMonth && isCurrentDay && ( event.startDate.endHour > date.getHours() || ( event.startDate.endHour == date.getHours() && event.startDate.endMinute > date.getMinutes() ) ) )
								{
									continue;
								}

								if ( $.simpleFilt.checkIf( checkArgs( event, appViewModel.userName ) ) )
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

						if ( isCurrentYear && parsedMonth < ( date.getMonth() + 1 ) )
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

								if ( isCurrentYear && isCurrentMonth && isCurrentDay && ( event.startDate.endHour < date.getHours() || ( event.startDate.endHour == date.getHours() && event.startDate.endMinute <= date.getMinutes() ) ) )
								{
									continue;
								}

								if ( $.simpleFilt.checkIf( checkArgs( event, appViewModel.userName ) ) )
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

								if ( $.simpleFilt.checkIf( checkArgs( event, appViewModel.userName ) ) )
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
	self.addEvent = function ( newKKEvent )
	{
		var today, endDay, oldOrUpcoming, event, didAddEvent = false, recentlyAddedEvents;

		var year = newKKEvent.startDate.year;
		var month = newKKEvent.startDate.month;
		var day = newKKEvent.startDate.day;

		var eventTreeYearProp = appViewModel.myEventTree[year] ? appViewModel.myEventTree[year] : appViewModel.myEventTree[year] = {};
		var eventTreeMonthProp = eventTreeYearProp[month] ? eventTreeYearProp[month] : eventTreeYearProp[month] = {};
		var dayEventsArr = eventTreeMonthProp[day] ? eventTreeMonthProp[day] : eventTreeMonthProp[day] = [], publicDayEventsArr;

		//1. add event to eventTree 
		for ( var i = 0; i < dayEventsArr.length; i++ )
		{
			event = dayEventsArr[i];
			if ( newKKEvent.startDate.startHour < event.startDate.startHour || ( newKKEvent.startDate.startHour == event.startDate.startHour && newKKEvent.startDate.startMinute < event.startDate.startMinute ) )
			{
				dayEventsArr.splice( i, 0, newKKEvent );
				didAddEvent = true;
				break;
			}
		}

		if ( !didAddEvent )
		{
			dayEventsArr.push( newKKEvent );
		}

		//2. update appViewModel.detailsPageEvents()
		if ( newKKEvent.startDate.year == appViewModel.detailsPage.dayPlanPart.dayPlanTableVM.date.year() && newKKEvent.startDate.month == appViewModel.detailsPage.dayPlanPart.dayPlanTableVM.date.month() && newKKEvent.startDate.day == appViewModel.detailsPage.dayPlanPart.dayPlanTableVM.date.day() )
		{
			appViewModel.detailsPage.dayPlanPart.eventListVM.events( dayEventsArr );

			appViewModel.removeEventRectanglesFromDetailsDay();

			appViewModel.setCalendarPlacementRow( dayEventsArr );
			appViewModel.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = 1;

			for ( var i in dayEventsArr )
			{
				appViewModel.drawEventToDetailsDayTable( dayEventsArr[i] );
			}

			appViewModel.resizeDetailsDayTable( appViewModel.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow );
		}

		//3. add event to appViewModel.detailsPage.journalPart.eventListVM.menuItems.myCalendar.selectedEvents
		if ( appViewModel.detailsPage.journalPart.eventListVM.isOpen() && appViewModel.detailsPage.journalPart.eventListVM.selectedMenuItem() == 1 && $.inArray( newKKEvent.kind.value, appViewModel.detailsPage.journalPart.eventListVM.selectedEventKindValues ) > -1 )
		{
			today = new Date();
			endDate = new Date( newKKEvent.startDate.year, newKKEvent.startDate.month - 1, newKKEvent.startDate.day, newKKEvent.startDate.endHour, newKKEvent.startDate.endMinute, 0, 0 );

			if ( today > endDate )
			{
				oldOrUpcoming = appViewModel.detailsPage.journalPart.eventListVM.menuItems.myCalendar.selectedEvents.old;
			} else
			{
				oldOrUpcoming = appViewModel.detailsPage.journalPart.eventListVM.menuItems.myCalendar.selectedEvents.upcoming;
			}

			oldOrUpcoming.push( newKKEvent );
		}

		//4. increment appViewModel.myEventTreeCountBasedOnEventKind value
		appViewModel.changeEventCountTreeValueBasedOnEventKind( appViewModel.myEventTreeCountBasedOnEventKind, newKKEvent, 1 );

		/////////////////////////////////
		// Public events
		/////////////////////////////////
		if ( newKKEvent.privacyLevel.value === appViewModel.eventPrivacyLevels["public"] )
		{
			//1. add event to public event tree
			eventTreeYearProp = appViewModel.publicEventTree[year] ? appViewModel.publicEventTree[year] : appViewModel.publicEventTree[year] = {};
			eventTreeMonthProp = eventTreeYearProp[month] ? eventTreeYearProp[month] : eventTreeYearProp[month] = {};
			publicDayEventsArr = eventTreeMonthProp[day] ? eventTreeMonthProp[day] : eventTreeMonthProp[day] = [];
			didAddEvent = false;

			for ( var i = 0; i < publicDayEventsArr.length; i++ )
			{
				event = publicDayEventsArr[i];

				if ( event.id == newKKEvent.id )
				{
					// this check is for when adding public event to user's calendar - the public event already exists so do not add it again to public event tree.
					break;
				}

				if ( newKKEvent.startDate.startHour < event.startDate.startHour || ( newKKEvent.startDate.startHour == event.startDate.startHour && newKKEvent.startDate.startMinute < event.startDate.startMinute ) )
				{
					publicDayEventsArr.splice( i, 0, newKKEvent );
					didAddEvent = true;
					break;
				}
			}

			if ( !didAddEvent )
			{
				publicDayEventsArr.push( newKKEvent );
			}

			//2. add event to publicEvents observable array
			appViewModel.lobbyPage.eventGridPart.publicEventsVM.push( newKKEvent );

			//3. add event to menuItems.selectedEvents

			// lobby page
			if ( appViewModel.lobbyPage.upcomingEventsPart.eventListVM.isOpen() && $.inArray( newKKEvent.kind.value, appViewModel.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.selectedEvents.selectedEventKindValues ) > -1 )
			{
				today = new Date();
				endDate = new Date( newKKEvent.startDate.year, newKKEvent.startDate.month - 1, newKKEvent.startDate.day, newKKEvent.startDate.endHour, newKKEvent.startDate.endMinute, 0, 0 );

				if ( today > endDate )
				{
					oldOrUpcoming = appViewModel.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.selectedEvents.old;
				} else
				{
					oldOrUpcoming = appViewModel.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.selectedEvents.upcoming;
				}

				oldOrUpcoming.push( newKKEvent );
			}

			//details page
			if ( appViewModel.detailsPage.journalPart.eventListVM.isOpen() && appViewModel.detailsPage.journalPart.eventListVM.selectedMenuItem() === 2 )
			{
				today = new Date();
				endDate = new Date( newKKEvent.startDate.year, newKKEvent.startDate.month - 1, newKKEvent.startDate.day, newKKEvent.startDate.endHour, newKKEvent.startDate.endMinute, 0, 0 );

				if ( today > endDate )
				{
					oldOrUpcoming = appViewModel.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.selectedEvents.old;
				} else
				{
					oldOrUpcoming = appViewModel.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.selectedEvents.upcoming;
				}

				oldOrUpcoming.push( newKKEvent );
			}

			//4. increment appViewModel.myEventTreeCountBasedOnEventKind value
			appViewModel.changeEventCountTreeValueBasedOnEventKind( appViewModel.lobbyPage.upcomingEventsPart.publicEventTreeCountBasedOnEventKindVM, newKKEvent, 1 );

			//5. appViewModel.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM repopulate the list
			for ( var i = 0, recentlyAddedEvents = appViewModel.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM() ; i < recentlyAddedEvents.length; i++ )
			{
				event = recentlyAddedEvents[i];
				if ( newKKEvent.id === event.id )
				{
					appViewModel.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM.swap( event, newKKEvent );
					break;
				}
			}
		}

		return dayEventsArr;
	};

	self.removeEvent = function ( id, year, month, day, isEditEventCalled )
	{
		var eventTree = appViewModel.publicEventTree;
		var eventTreeYearProp, eventTreeMonthProp, dayEvents, event;
		var today, endDate, oldOrUpcoming;
		var $container, h, recentlyAddedEvents, cellObj, assignedCell = false;

		// remove from public tree
		if ( eventTree[year] )
		{
			eventTreeYearProp = eventTree[year];
			if ( eventTreeYearProp[month] )
			{
				eventTreeMonthProp = eventTreeYearProp[month];
				if ( eventTreeMonthProp[day] )
				{
					dayEvents = eventTreeMonthProp[day];

					for ( var i = 0; i < dayEvents.length; i++ )
					{
						event = dayEvents[i];
						if ( event.id === id )
						{
							//1.1 remove from eventTree
							dayEvents.splice( i, 1 );

							if ( !dayEvents.length )
							{
								//if array node that contains daily events is empty then remove the node from eventTree
								delete eventTreeMonthProp[day];
							}

							//1.2 remove event from appViewModel.lobbyPage.eventGridPart.publicEventsVM
							appViewModel.lobbyPage.eventGridPart.publicEventsVM.remove( function ( event )
							{
								return event.id === id;
							} );

							//1.3 decrement appViewModel.lobbyPage.upcomingEventsPart.publicEventTreeCountBasedOnEventKindVM value
							appViewModel.changeEventCountTreeValueBasedOnEventKind( appViewModel.lobbyPage.upcomingEventsPart.publicEventTreeCountBasedOnEventKindVM, event, -1 );


							//1.4 if selected events panel is open and the deleted event is displayed on the list then remove it from eventListVM.menuItems.publicEvents.selectedEvents
							if ( appViewModel.lobbyPage.upcomingEventsPart.eventListVM.isOpen() && appViewModel.lobbyPage.upcomingEventsPart.eventListVM.selectedMenuItem() === 1 )
							{
								today = new Date();
								endDate = new Date( event.startDate.year, event.startDate.month - 1, event.startDate.day, event.startDate.endHour, event.startDate.endMinute, 0, 0 );

								if ( today > endDate )
								{
									oldOrUpcoming = appViewModel.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.selectedEvents.old;
								} else
								{
									oldOrUpcoming = appViewModel.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.selectedEvents.upcoming;
								}

								oldOrUpcoming.remove( function ( event )
								{
									return event.id === id;
								} );
							}
						}
					}
				}
			}
		}
		//remove from myEventTree
		eventTree = appViewModel.myEventTree;

		if ( eventTree[year] )
		{
			eventTreeYearProp = eventTree[year];
			if ( eventTreeYearProp[month] )
			{
				eventTreeMonthProp = eventTreeYearProp[month];
				if ( eventTreeMonthProp[day] )
				{
					dayEvents = eventTreeMonthProp[day];

					for ( var i = 0; i < dayEvents.length; i++ )
					{
						event = dayEvents[i];
						if ( event.id === id )
						{
							//2.1 remove event from eventTree
							dayEvents.splice( i, 1 );

							if ( !dayEvents.length )
							{
								//if array node that contains daily events is empty then remove the node from eventTree
								delete eventTreeMonthProp[day];
							}

							//2.2 if selected events panel is open and the deleted event is displayed on the list then remove it from  menuItems.myCalendar.selectedEvents
							if ( appViewModel.detailsPage.journalPart.eventListVM.isOpen() && appViewModel.detailsPage.journalPart.eventListVM.selectedMenuItem() === 1 )
							{
								today = new Date();
								endDate = new Date( event.startDate.year, event.startDate.month - 1, event.startDate.day, event.startDate.endHour, event.startDate.endMinute, 0, 0 );

								if ( today > endDate )
								{
									oldOrUpcoming = appViewModel.detailsPage.journalPart.eventListVM.menuItems.myCalendar.selectedEvents.old;
								} else
								{
									oldOrUpcoming = appViewModel.detailsPage.journalPart.eventListVM.menuItems.myCalendar.selectedEvents.upcoming;
								}

								oldOrUpcoming.remove( function ( event )
								{
									return event.id === id;
								} );
							}

							//2.3 if managage own events panel is open and the deleted event is displayed on the list then remove it from  menuItems.manageOwnPublicEvents.selectedEvents
							if ( appViewModel.detailsPage.journalPart.eventListVM.isOpen() && appViewModel.detailsPage.journalPart.eventListVM.selectedMenuItem() === 2 )
							{
								today = new Date();
								endDate = new Date( event.startDate.year, event.startDate.month - 1, event.startDate.day, event.startDate.endHour, event.startDate.endMinute, 0, 0 );

								if ( today > endDate )
								{
									oldOrUpcoming = appViewModel.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.selectedEvents.old;
								} else
								{
									oldOrUpcoming = appViewModel.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.selectedEvents.upcoming;
								}

								oldOrUpcoming.remove( function ( event )
								{
									return event.id === id;
								} );
							}

							//2.4 decrement appViewModel.myEventTreeCountBasedOnEventKind value
							appViewModel.changeEventCountTreeValueBasedOnEventKind( appViewModel.myEventTreeCountBasedOnEventKind, event, -1 );

							//2.5 if event is present in appViewModel.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM
							for ( var i = 0, recentlyAddedEvents = appViewModel.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM() ; i < recentlyAddedEvents.length; i++ )
							{
								event = recentlyAddedEvents[i];
								if ( id === event.id )
								{
									if ( !isEditEventCalled )
									{
										//TODO: not optimal because sorting public events everytime we add a new event.. maybe refactor
										recentlyAddedEvents = appViewModel.lobbyPage.eventGridPart.publicEventsVM().sort( function ( event1, event2 )
										{
											return event1.dateAdded.javaScriptDate - event2.dateAdded.javaScriptDate;
										} );
										appViewModel.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM( recentlyAddedEvents.slice( Math.max( recentlyAddedEvents.length - 5, 1 ) ).reverse() );
									}
									break;
								}
							}

							return;
						}
					}
				}
			}
		}
	};
}