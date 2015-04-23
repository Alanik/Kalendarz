﻿var EventTreeBuilder = function () {
	var self = this;

	self.buildEventTree = function ( yearEventTreeModel, calendarViewModel, isPublicEventTree)
	{
		var eventTree = {}, largest, groups;
		var dayGroup, day, dayGroupLength, event;
		var year, yearProp, eventTreeYearProp, eventTreeMonthProp, eventTreeDayGroupProp, eventTreeEventsProp;

		for (var y = 0; y < yearEventTreeModel.length; y++) {
			yearProp = yearEventTreeModel[y];
			year = yearProp.year
			eventTreeYearProp = eventTree[year] ? eventTree[year] : eventTree[year] = {};

			for (var k = 0; k < yearProp.eventsGroupedByMonth.length; k++) {

				eventTreeMonthProp = eventTreeYearProp[yearProp.eventsGroupedByMonth[k].month] = {};
				groups = yearProp.eventsGroupedByMonth[k].eventsGroupedByDay;

				//event day groups
				for (var i = 0; i < groups.length; i++) {

					dayGroup = groups[i];
					day = dayGroup.day;

					dayGroupLength = dayGroup.events.length;
					eventTreeDayGroupProp = eventTreeMonthProp[day] = [];

					// events in the day group
					for (var j = 0; j < dayGroupLength; j++) {
						event = dayGroup.events[j];

						setAddress(event);
						setKind(event);
						setStartDate(event);
						setDateAdded(event);
						eventTreeDayGroupProp.push(event);

						//push public event to calendarViewModel.publicEvents
						//TODO: maybe it's better to remove it from here and put it in a seperate method for example buildPublicEventTree, but it is just a suggestion
						if (isPublicEventTree) {
							calendarViewModel.publicEvents.push(event);
							}
					}

					calendarViewModel.setCalendarPlacementRow(eventTreeDayGroupProp);
				}

				eventTreeYearProp[yearProp.eventsGroupedByMonth[k].month] = eventTreeMonthProp;
			}
		}

		function setKind(event) {
			var colorHelper = new EventColorHelper();
			event.kind.color = colorHelper.calculatePrivateEventColor(event.kind.value);
			event.kind.headerColor = colorHelper.calculateEventHeaderTxtColor(event.kind.value);
			event.kind.detailsPageEventBorderColor = colorHelper.calculateEventDetailsBorderColor(event.kind.value);
		};
		function setStartDate(event) {
			var sdate = new Date(parseInt(event.startDate.substr(6)));
			var edate = new Date(parseInt(event.endDate.substr(6)));

			event.startDate = new KKEventDateModel(sdate, sdate.getMinutes(), edate.getMinutes(), sdate.getHours(), edate.getHours(), sdate.getDate(), sdate.getMonth() + 1, sdate.getFullYear());
			event.eventLengthInMinutes = ((parseInt(edate.getHours(), 10) - parseInt(sdate.getHours(), 10)) * 60) + (parseInt(edate.getMinutes(), 10) - parseInt(sdate.getMinutes(), 10));
		};
		function setDateAdded(event) {
			var sdate = new Date(parseInt(event.dateAdded.substr(6)));
			event.dateAdded = new KKDateModel( sdate, sdate.getMinutes(), sdate.getHours(), sdate.getDate(), sdate.getMonth() + 1, sdate.getFullYear() );
		}
		function setAddress(event) {

			if (!event.addresses[0]) {
				event.address = {
					street: "",
					city: "",
					zipCode: ""
				}
			} else {
				event.address = event.addresses[0];
			}
			delete event.addresses;
		};

		return eventTree;
	};

	self.buildEventTreeCountBasedOnEventKind = function (eventsCountTree, defaultEventKinds) {
		var eventTree = {}, element

		for ( var i = 0; i < defaultEventKinds.length; i++ )
		{
			element = eventTree[i] = {};

			if ( eventsCountTree[i])
			{
				element.eventKindValue = eventsCountTree[i].value;
				element.events = {};
				element.events.upcoming = ko.observable(eventsCountTree[i].events.upcoming);
				element.events.old = ko.observable((eventsCountTree[i].events.all - eventsCountTree[i].events.upcoming));
			} else {
				//events with given eventKind.value do not exist so we need to create an empty object

				element.eventKindValue = i + 1;
				element.events = {};
				element.events.upcoming = ko.observable(0);
				element.events.old = ko.observable(0);

				eventsCountTree.splice(i, 0, element);
			}
		}

		return eventTree;
	};

	self.transformNews = function (eventsArray) {
		var event, events = [];

		for (var i = 0; i < eventsArray.length; i++) {
			event = eventsArray[i];

			setDateAdded(event);
			events.push(event);
		}

		return events;

		function setDateAdded(event) {
			var sdate = new Date(parseInt(event.dateAdded.substr(6)));
			event.dateAdded = new KKDateModel(sdate, sdate.getMinutes(), sdate.getHours(), sdate.getDate(), sdate.getMonth() + 1, sdate.getFullYear());
		}
	}
};