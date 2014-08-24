var EventTreeBuilder = function (myEvents, eventTree) {
	var self = this;
	self.myEvents = myEvents;
	self.eventTree = eventTree;

	self.build = function () {
		var lengh, largest;
		var groups = self.myEvents.eventsGroupedByDay;
		var groupsLength = self.myEvents.eventsGroupedByDay.length;
		var dayGroup, day, dayGroupLength, event;

		var year = self.myEvents.year;
		var month = self.myEvents.month;

		var eventTreeYearProp = self.eventTree[year] ? self.eventTree[year] : self.eventTree[year] = {};
		var eventTreeMonthProp = eventTreeYearProp[month] = {};
		var eventTreeDayGroupProp;
		var eventTreeEventsProp;

		var eventsInTheSameDay;

		//event day groups
		for (var i = 0; i < groupsLength; i++) {

			dayGroup = groups[i];
			day = dayGroup.day;

			dayGroupLength = dayGroup.events.length;

			eventTreeDayGroupProp = eventTreeMonthProp[day] = [];

			eventsInTheSameDay = [];

			// events in the day group
			for (var j = 0; j < dayGroupLength; j++) {
				event = dayGroup.events[j];

				setAddress(event);
				setKind(event);
				setStartDate(event);
				setCalendarPlacementRow(event, eventsInTheSameDay);

				eventTreeDayGroupProp.push(event);
			}
		}

		function setKind(event) {
			var colorHelper = new EventColorHelper();
			event.kind.color = colorHelper.calculatePrivateEventColor(event.kind.value);
			event.kind.headerColor = colorHelper.calculateEventHeaderTxtColor(event.kind.value);
		}
		function setStartDate(event) {
			
			var date = new Date(parseInt(event.startDate.substr(6)));
			var length = parseInt(event.eventLengthInMinutes, 10);
			var startMinute = date.getMinutes();
			var startHour = date.getHours();
			var endMinute, hourSpan, minuteDiff, lengthModulo;

				lengthModulo = length % 60;
				minuteDiff = 60 - startMinute;
				if (minuteDiff < lengthModulo) {
					hourSpan = 1;
					endMinute = lengthModulo - minuteDiff;
				}
				else if (minuteDiff == lengthModulo) {
					hourSpan = 1;
					endMinute = 0;
				}
				else {
					hourSpan = 0;
					endMinute = lengthModulo + startMinute;
				}			

			var transformedDate = {
				"startMinute": startMinute,
				"endMinute": endMinute,
				"startHour": startHour,
				"endHour": (startHour + hourSpan + Math.floor(length / 60)),
				"day": date.getDate(),
				"month": date.getMonth(),
				"year": date.getFullYear()
			};

			event.startDate = transformedDate;
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
		function setCalendarPlacementRow(event, eventsInTheSameDay) {
			var len = eventsInTheSameDay.length;
			var anotherEvent;

			var eStartH = event.startDate.startHour;
			var eEndH = event.startDate.endHour;
			var eStartM = event.startDate.startMinute;
			var eEndM = event.startDate.endMinute

			for (var i = 0; i < len; i++) {
				anotherEvent = eventsInTheSameDay[i];

				var aeStartH = anotherEvent.startDate.startHour;
				var aeEndH = anotherEvent.startDate.endHour;
				var aeStartM = anotherEvent.startDate.starMinute;
				var aeEndM = anotherEvent.startDate.endMinute

				//eventStartTime < anotherEventEndTime || eventEndTime > anotherEventStartTime
				if ((eStartH < aeEndH || (eStartH == aeEndH && eStartM < aeEndM)) || (eEndH < aeStartH || eEndH == aeStartH && eEndM < aeStartM)) {
					//there is conflict

					if (event.calendarPlacementRow == anotherEvent.calendarPlacementRow) {
						event.calendarPlacementRow++;
					}
				}
			}

			eventsInTheSameDay.push(event);

			//TODO: current sorting not optimal, correct way is to insert value at the correct index
			eventsInTheSameDay.sort(function (a, b) {
				return parseInt(a.calendarPlacementRow, 10) - parseInt(b.calendarPlacementRow, 10)
			});
		}
	};


};