var EventTreeBuilder = function () {
	var self = this;

	self.buildEventTree = function (yearEventTreeModel, setCalendarPlacementRow) {
		var eventTree = {}, largest, groups;
		var dayGroup, day, dayGroupLength, event;
		var year, yearProp, eventTreeYearProp,eventTreeMonthProp, eventTreeDayGroupProp, eventTreeEventsProp;

		for (var y = 0; y < yearEventTreeModel.length; y++) {
			yearProp = yearEventTreeModel[y];
			year = yearProp.year
			eventTreeYearProp = eventTree[year] ? eventTree[year] : eventTree[year] = {};

			for (var k = 0; k < yearProp.eventsGroupedByMonth.length; k++) {

				eventTreeMonthProp = eventTreeYearProp[yearProp.eventsGroupedByMonth[k].month] = {};
				groups = yearProp.eventsGroupedByMonth[k].events;

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
						eventTreeDayGroupProp.push(event);
					}

					setCalendarPlacementRow(eventTreeDayGroupProp);
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

			var startMinute = sdate.getMinutes();
			var startHour = sdate.getHours();

			var endMinute = edate.getMinutes();
			var endHour = edate.getHours();

			var transformedDate = {
				"javascriptStartDate": sdate,
				"startMinute": startMinute,
				"endMinute": endMinute,
				"startHour": startHour,
				"endHour": endHour,
				"day": sdate.getDate(),
				"month": sdate.getMonth() + 1,
				"year": sdate.getFullYear(),
				"display": function (time) {
					return time < 10 ? '0' + time : time;
				},
				"displayFullDate": function () {
					return this.display(this.day) + '/' + this.display(this.month) + '/' + this.year;
				}
			};

			event.startDate = transformedDate;	

			event.eventLengthInMinutes = ((parseInt(endHour, 10) - parseInt(startHour, 10)) * 60) + (parseInt(endMinute, 10) - parseInt(startMinute, 10));
		};
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

	self.buildEventTreeCountBasedOnEventKind = function (myEventsCountTree) {
		var eventTree = {}, element;
		for (var i = 0; i < myEventsCountTree.length; i++) {
			element = eventTree[i + 1] = {};

			if (myEventsCountTree[i].value === (i + 1)) {
				element.eventKindValue = myEventsCountTree[i].value;
				element.events = {};
				element.events.upcoming = ko.observable(myEventsCountTree[i].events.upcoming);
				element.events.old = ko.observable((myEventsCountTree[i].events.all - myEventsCountTree[i].events.upcoming));
			} else {
				//events with given eventKind.value do not exist so we need to create an empty object

				element.eventKindValue = i + 1;
				element.events = {};
				element.events.upcoming = ko.observable(0);
				element.events.old = ko.observable(0);

				myEventsCountTree.splice(i, 0, element);
			}
		}

		return eventTree;
	};

	self.buildEventKinds = function (serverEventKinds) {
		var clientEventKinds = [];
		var eventKind;

		for (var i in serverEventKinds) {
			eventKind = serverEventKinds[i];


		}


	}
};	