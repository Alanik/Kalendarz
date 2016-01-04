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

		kkEventModel.addedBy = addedBy;
		kkEventModel.address.street = street;
		kkEventModel.address.city = city;
		kkEventModel.address.zipCode = zipCode;

		if ( dateAdded instanceof KKDateModel )
		{
			kkEventModel.dateAdded = dateAdded;
		}
		else
		{
			kkEventModel.dateAdded = new KKDateModel( dateAdded.minute, dateAdded.hour, dateAdded.day, dateAdded.month, dateAdded.year );
		}

		kkEventModel.description = description;
		kkEventModel.details = details;
		kkEventModel.eventLengthInMinutes = minutes;
		kkEventModel.kind.value = kindValue;
		kkEventModel.kind.name = kindName.toUpperCase();
		kkEventModel.kind.color = colorHelper.getEventColor( privacyLevelValue, kkEventModel.kind.value );
		kkEventModel.kind.headerColor = colorHelper.getEventBoxHeaderColor( kkEventModel.kind.value );
		kkEventModel.kind.detailsPageEventBorderColor = colorHelper.getEventDetailsBorderColor( kkEventModel.kind.value );
		kkEventModel.id = eventId;
		kkEventModel.occupancyLimit = occupancyLimit;
		kkEventModel.privacyLevel.name = privacyLevelName;
		kkEventModel.privacyLevel.value = privacyLevelValue;
		kkEventModel.startDate = startDate;
		kkEventModel.name = name;
		kkEventModel.urlLink = urlLink;
		kkEventModel.price = price;
		kkEventModel.isEventAddedToCurrentUserCalendar = ko.observable( isEventAddedToCurrentUserCalendar );
		kkEventModel.isCurrentUserSignedUpForEvent = ko.observable( isCurrentUserSignedUpForEvent );
		kkEventModel.status = eventStatus;

		return kkEventModel;
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

	self.getEventsByPropertyValue = function ( eventTree, propValueInputsArr, oldUpcomingOrAll )
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
								//prop = event;

								if ( isCurrentYear && isCurrentMonth && isCurrentDay && ( event.startDate.endHour > date.getHours() || ( event.startDate.endHour == date.getHours() && event.startDate.endMinute > date.getMinutes() ) ) )
								{
									continue;
								}



								//var result = false;
								//var propValueInputsArr = [{ "prop": ["kind", "value"], "values": valueArr }, { "prop": ["addedBy"], "values" : [ self.userName ] }];

								//for ( var j = 0; j < propValueInputsArr.length; j++ )
								//{
								//	var paramObj = propValueInputsArr[j];
								//	for ( var k = 0; k < paramObj.prop.length; k++ )
								//	{
								//		prop = prop[paramObj.prop[k]];
								//	}

								//	for ( var l = 0; l < paramObj.values.length; l++ )
								//	{
								//		if ( prop === paramObj.values[l] )
								//		{
								//			result = true;
								//		}
								//		else
								//		{
								//			result = false;
								//			break;
								//		}
								//	}

								//	if ( result === false )
								//	{
								//		break;
								//	}

								//	prop = event;
								//}

								//if ( result )
								//{
								//	arr.push( event );
								//}
								debugger;
								var propValueInputsArr = [{ "prop": event.kind.value, "values": valueArr }, { "boolSpecifier" : 'and', "prop": event.addedBy, "values": [appViewModel.userName] }];

								if ( $.checkByPropertyAndOrPredicate( propValueInputsArr ) )
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
								prop = event;

								if ( isCurrentYear && isCurrentMonth && isCurrentDay && ( event.startDate.endHour < date.getHours() || ( event.startDate.endHour == date.getHours() && event.startDate.endMinute <= date.getMinutes() ) ) )
								{
									continue;
								}

								for ( var j = 0; j < eventPropNameArray.length; j++ )
								{
									prop = prop[eventPropNameArray[j]];
								}

								for ( var n = 0; n < values.length; n++ )
								{
									if ( prop === values[n] )
									{
										arr.push( event );
										break;
									}
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

								for ( var n = 0; n < values.length; n++ )
								{
									if ( prop === values[n] )
									{
										arr.push( event );
										break;
									}
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
		var today, endDay, oldOrUpcoming, event, didAddEvent = false;

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
		if ( newKKEvent.startDate.year == appViewModel.detailsPageDisplayDate.year() && newKKEvent.startDate.month == appViewModel.detailsPageDisplayDate.month() && newKKEvent.startDate.day == appViewModel.detailsPageDisplayDate.day() )
		{
			appViewModel.detailsPageDayEvents( dayEventsArr );

			appViewModel.removeEventRectanglesFromDetailsDay();
			appViewModel.setCalendarPlacementRow( dayEventsArr );
			appViewModel.detailsPageEventMostBottomRow = 1;

			for ( var i in dayEventsArr )
			{
				appViewModel.drawEventToDetailsDayTable( dayEventsArr[i] );
			}

			appViewModel.resizeCalendarDayDetailsTable( appViewModel.detailsPageEventMostBottomRow );
		}

		//3. add event to appViewModel.detailsPageJournalMenu.menuItems.myCalendar.selectedEvents
		if ( appViewModel.detailsPageJournalMenu.isOpen() && appViewModel.detailsPageJournalMenu.selectedMenuItem() == 1 && $.inArray( newKKEvent.kind.value, appViewModel.detailsPageJournalMenu.menuItems.myCalendar.selectedEvents.selectedKindValues ) > -1 )
		{
			today = new Date();
			endDate = new Date( newKKEvent.startDate.year, newKKEvent.startDate.month - 1, newKKEvent.startDate.day, newKKEvent.startDate.endHour, newKKEvent.startDate.endMinute, 0, 0 );

			if ( today > endDate )
			{
				oldOrUpcoming = appViewModel.detailsPageJournalMenu.menuItems.myCalendar.selectedEvents.old;
			} else
			{
				oldOrUpcoming = appViewModel.detailsPageJournalMenu.menuItems.myCalendar.selectedEvents.upcoming;
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
					return dayEventsArr;
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
			appViewModel.publicEvents.push( newKKEvent );

			//3. add event to menuItems.selectedEvents

			// lobby page
			if ( appViewModel.lobbyPagePublicEventListMenu.isOpen() && $.inArray( newKKEvent.kind.value, appViewModel.lobbyPagePublicEventListMenu.menuItems.publicEvents.selectedEvents.selectedKindValues ) > -1 )
			{
				today = new Date();
				endDate = new Date( newKKEvent.startDate.year, newKKEvent.startDate.month - 1, newKKEvent.startDate.day, newKKEvent.startDate.endHour, newKKEvent.startDate.endMinute, 0, 0 );

				if ( today > endDate )
				{
					oldOrUpcoming = appViewModel.lobbyPagePublicEventListMenu.menuItems.publicEvents.selectedEvents.old;
				} else
				{
					oldOrUpcoming = appViewModel.lobbyPagePublicEventListMenu.menuItems.publicEvents.selectedEvents.upcoming;
				}

				oldOrUpcoming.push( newKKEvent );
			}

			//details page
			if ( appViewModel.detailsPageJournalMenu.isOpen() && appViewModel.detailsPageJournalMenu.selectedMenuItem() === 2 )
			{
				today = new Date();
				endDate = new Date( newKKEvent.startDate.year, newKKEvent.startDate.month - 1, newKKEvent.startDate.day, newKKEvent.startDate.endHour, newKKEvent.startDate.endMinute, 0, 0 );

				if ( today > endDate )
				{
					oldOrUpcoming = appViewModel.detailsPageJournalMenu.menuItems.manageOwnPublicEvents.selectedEvents.old;
				} else
				{
					oldOrUpcoming = appViewModel.detailsPageJournalMenu.menuItems.manageOwnPublicEvents.selectedEvents.upcoming;
				}

				oldOrUpcoming.push( newKKEvent );
			}

			//4. increment appViewModel.myEventTreeCountBasedOnEventKind value
			appViewModel.changeEventCountTreeValueBasedOnEventKind( appViewModel.publicEventTreeCountBasedOnEventKind, newKKEvent, 1 );
		}

		return dayEventsArr;
	};

	self.removeEvent = function ( id, year, month, day )
	{
		var eventTree = appViewModel.myEventTree;
		var eventTreeYearProp, eventTreeMonthProp, dayEvents, event;
		var today, endDate, oldOrUpcoming;
		var $container, h;

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
							//1. remove event from eventTree
							dayEvents.splice( i, 1 );

							if ( !dayEvents.length )
							{
								//if array node that contains daily events is empty then remove the node from eventTree
								delete eventTreeMonthProp[day];
							}

							//2. if selected events panel is open and the deleted event is displayed on the list then remove it from  menuItems.myCalendar.selectedEvents
							if ( appViewModel.detailsPageJournalMenu.isOpen() && appViewModel.detailsPageJournalMenu.selectedMenuItem() === 1 )
							{
								today = new Date();
								endDate = new Date( event.startDate.year, event.startDate.month - 1, event.startDate.day, event.startDate.endHour, event.startDate.endMinute, 0, 0 );

								if ( today > endDate )
								{
									oldOrUpcoming = appViewModel.detailsPageJournalMenu.menuItems.myCalendar.selectedEvents.old;
								} else
								{
									oldOrUpcoming = appViewModel.detailsPageJournalMenu.menuItems.myCalendar.selectedEvents.upcoming;
								}

								oldOrUpcoming.remove( function ( event )
								{
									return event.id === id;
								} );
							}

							//3. decrement appViewModel.myEventTreeCountBasedOnEventKind value
							appViewModel.changeEventCountTreeValueBasedOnEventKind( appViewModel.myEventTreeCountBasedOnEventKind, event, -1 );

							//4. update appViewModel.detailsPageEvents()
							if ( year == appViewModel.detailsPageDisplayDate.year() && month == appViewModel.detailsPageDisplayDate.month() && day == appViewModel.detailsPageDisplayDate.day() )
							{
								$container = $( "#details #detailsEventsAndNotesContainer .details-event-block-container[data-eventid='" + id + "']" );
								$container.fadeOut( 500, function ()
								{
									$container.remove();

									//redraw details page event rectangle table
									appViewModel.removeEventRectanglesFromDetailsDay();
									dayEvents = appViewModel.detailsPageDayEvents();

									appViewModel.setCalendarPlacementRow( dayEvents );
									appViewModel.detailsPageEventMostBottomRow = 1;

									for ( var i in dayEvents )
									{
										appViewModel.drawEventToDetailsDayTable( dayEvents[i] );
									}

									appViewModel.resizeCalendarDayDetailsTable( appViewModel.detailsPageEventMostBottomRow );

									//for calendar to redraw events in day cell
									appViewModel.calendarDayEventsToUpdate.day = appViewModel.detailsPageDisplayDate.day();
									appViewModel.calendarDayEventsToUpdate.month = appViewModel.detailsPageDisplayDate.month();
									appViewModel.calendarDayEventsToUpdate.year = appViewModel.detailsPageDisplayDate.year();
									appViewModel.calendarDayEventsToUpdate.events = dayEvents;
								} );
							}

							return;
						}
					}
				}
			}
		}
	};

}