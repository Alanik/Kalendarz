var EventTreeBuilder = function (yearEventTreeModel, setCalendarPlacementRow) {
	var self = this;

	//server event tree model
	self.yearEventTreeModel = yearEventTreeModel;

	//client tree model
	self.eventTree = {};

	self.build = function () {
		var lengh, largest;
		var groups;
		var groupsLength;
		var dayGroup, day, dayGroupLength, event;
		var year = self.yearEventTreeModel.year;
		var eventTreeYearProp = self.eventTree[year] ? self.eventTree[year] : self.eventTree[year] = {};
		var eventTreeMonthProp, eventTreeDayGroupProp, eventTreeEventsProp;

		for (var k in self.yearEventTreeModel.eventsGroupedByMonth) {

			eventTreeMonthProp = eventTreeYearProp[self.yearEventTreeModel.eventsGroupedByMonth[k].month] = {};
			groups = self.yearEventTreeModel.eventsGroupedByMonth[k].events;
			groupsLength = self.yearEventTreeModel.eventsGroupedByMonth[k].events.length;

			//event day groups
			for (var i = 0; i < groupsLength; i++) {

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

			eventTreeYearProp[self.yearEventTreeModel.eventsGroupedByMonth[k].month] = eventTreeMonthProp;
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
				"startMinute": startMinute,
				"endMinute": endMinute,
				"startHour": startHour,
				"endHour": endHour,
				"day": sdate.getDate(),
				"month": sdate.getMonth() + 1,
				"year": sdate.getFullYear()
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

		return self.eventTree;
	};
};