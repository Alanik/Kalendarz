﻿var EventTreeBuilder = function ()
{
	var self = this;

	self.buildEventTree = function ( yearEventTreeModel, appViewModel, isPublicEventTree )
	{
		var eventTree = {}, largest, groups;
		var dayGroup, day, dayGroupLength, event;
		var year, yearProp, eventTreeYearProp, eventTreeMonthProp, eventTreeDayGroupProp, eventTreeEventsProp;

		for ( var y = 0; y < yearEventTreeModel.length; y++ )
		{
			yearProp = yearEventTreeModel[y];
			year = yearProp.year
			eventTreeYearProp = eventTree[year] ? eventTree[year] : eventTree[year] = {};

			for ( var k = 0; k < yearProp.eventsGroupedByMonth.length; k++ )
			{

				eventTreeMonthProp = eventTreeYearProp[yearProp.eventsGroupedByMonth[k].month] = {};
				groups = yearProp.eventsGroupedByMonth[k].eventsGroupedByDay;

				//event day groups
				for ( var i = 0; i < groups.length; i++ )
				{

					dayGroup = groups[i];
					day = dayGroup.day;

					dayGroupLength = dayGroup.events.length;
					eventTreeDayGroupProp = eventTreeMonthProp[day] = [];

					// events in the day group
					for ( var j = 0; j < dayGroupLength; j++ )
					{
						event = dayGroup.events[j];

						setAddress( event );
						setKind( event );
						setStartDate( event );
						setDateAdded( event );
						eventTreeDayGroupProp.push( event );

						//push public event to appViewModel.publicEvents
						//TODO: maybe it's better to remove it from here and put it in a seperate method for example buildPublicEventTree, but it is just a suggestion
						if ( isPublicEventTree )
						{
							appViewModel.publicEvents.push( event );
						}
					}

					appViewModel.setCalendarPlacementRow( eventTreeDayGroupProp );
				}

				eventTreeYearProp[yearProp.eventsGroupedByMonth[k].month] = eventTreeMonthProp;
			}
		}

		function setKind( event )
		{
			var colorHelper = new EventColorHelper();
			event.kind.color = colorHelper.getEventColor(event.privacyLevel.value, event.kind.value );
			event.kind.headerColor = colorHelper.getEventBoxHeaderColor( event.kind.value );
			event.kind.detailsPageEventBorderColor = colorHelper.getEventDetailsBorderColor( event.kind.value );
		};
		function setStartDate( event )
		{
			//TODO: create KKEventModel from the event returned from the server

			////////////////////////////////////////////////////////////////
			//in javascript months start from 0 to 11 so we need to adjust it
			event.startDate.month = event.startDate.month - 1;
			////////////////////////////////////////////////////////////////

			var sdate = new Date( event.startDate.year, event.startDate.month, event.startDate.day, event.startDate.hour, event.startDate.minute, 0, 0 );
			var edate;

			if ( event.endDate )
			{
				////////////////////////////////////////////////////////////////
				//in javascript months start from 0 to 11 so we need to adjust it
				event.endDate.month = event.endDate.month - 1;
				////////////////////////////////////////////////////////////////

				edate = new Date( event.endDate.year, event.endDate.month, event.endDate.day, event.endDate.hour, event.endDate.minute, 0, 0 );
				event.startDate = new KKEventDateModel( sdate, sdate.getMinutes(), edate.getMinutes(), sdate.getHours(), edate.getHours(), sdate.getDate(), sdate.getMonth(), sdate.getFullYear() );
				event.eventLengthInMinutes = ( ( parseInt( edate.getHours(), 10 ) - parseInt( sdate.getHours(), 10 ) ) * 60 ) + ( parseInt( edate.getMinutes(), 10 ) - parseInt( sdate.getMinutes(), 10 ) );
			} else
			{
				event.startDate = new KKEventDateModel( sdate, sdate.getMinutes(), null, sdate.getHours(), null, sdate.getDate(), sdate.getMonth(), sdate.getFullYear() );
				event.eventLengthInMinutes = 0;
			}
		};
		function setDateAdded( event )
		{
			var sdate = new Date( parseInt( event.dateAdded.substr( 6 ) ) );
			event.dateAdded = new KKDateModel( sdate, sdate.getMinutes(), sdate.getHours(), sdate.getDate(), sdate.getMonth(), sdate.getFullYear() );
		}
		function setAddress( event )
		{
			if ( !event.addresses[0] )
			{
				event.address = {
					street: "",
					city: "",
					zipCode: ""
				}
			} else
			{
				event.address = event.addresses[0];
			}
			delete event.addresses;
		};

		return eventTree;
	};

	self.buildEventTreeCountBasedOnEventKind = function ( indexViewModelEventCountTree, defaultEventKinds )
	{
		var eventTree = {}, element, eventCountTreeElement;

		for ( var i = 0; i < defaultEventKinds.length; i++ )
		{
			element = eventTree[i + 1] = {};
			eventCountTreeElement = indexViewModelEventCountTree[i];

			if ( eventCountTreeElement && eventCountTreeElement.value == ( i + 1 ) )
			{
				element.upcoming = ko.observable( eventCountTreeElement.events.upcoming );
				element.old = ko.observable( eventCountTreeElement.events.old );
			} else
			{
				//events with given eventKind.value do not exist so we need to create an empty object

				element.upcoming = ko.observable( 0 );
				element.old = ko.observable( 0 );

				indexViewModelEventCountTree.splice( i, 0, element );
			}
		}

		return eventTree;
	};

	self.transformNews = function ( eventsArray )
	{
		var event, events = [];

		for ( var i = 0; i < eventsArray.length; i++ )
		{
			event = eventsArray[i];

			setDateAdded( event );
			events.push( event );
		}

		return events;

		function setDateAdded( event )
		{
			var sdate = new Date( parseInt( event.dateAdded.substr( 6 ) ) );
			event.dateAdded = new KKDateModel( sdate, sdate.getMinutes(), sdate.getHours(), sdate.getDate(), sdate.getMonth() + 1, sdate.getFullYear() );
		}
	}
};