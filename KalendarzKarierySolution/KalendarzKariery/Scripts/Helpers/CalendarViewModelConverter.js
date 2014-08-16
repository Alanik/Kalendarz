var CalendarViewModelConverter = function (evColHelper) {
	var self = this;
	var colorHelper = evColHelper;

	var event;
	var listOfEvents;

	var setTitle = function (title) {
		event.title = title;
	};

	var setDescription = function (description) {
		event.description = description;
	};

	var setDetails = function (details) {
		event.details = details;
	};

	var setDateAdded = function (dateStr) {
		event.dateAdded = dateStr;
	};

	var setStartDate = function (startDate, length) {
		var dateAndTime = startDate.replace('T', ' ').split(' ');

		//TODO: remove the double replace function
		var dateStr = dateAndTime[0].replace('-', '/').replace('-', '/');
		var date = new Date(dateStr);

		var timeStr = dateAndTime[1].split(':');
		var h = parseInt(timeStr[0], 10);
		var m = parseInt(timeStr[1], 10);

		var minutes = (length % 60);
		var hours = (length - minutes) / 60;

		var transformedDate = {
			"startMinute": m,
			"endMinute": minutes,
			"startHour": h,
			"endHour": (h + hours),
			"day": date.getDate(),
			"month": date.getMonth(),
			"year": date.getFullYear()
		};

		event.startDate = transformedDate;
	};

	var setEventLengthInMinutes = function (minutes) {
		event.eventLengthInMinutes = minutes;
	};

	var setOccupancyLimit = function (limit) {
		event.occupancyLimit = limit;
	};

	var setUrlLink = function (url) {
		event.urlLink = url;
	};

	var setKind = function (kind) {
		event.kind = {
			"kindName": ko.observable(kind),
			"color": colorHelper.calculatePrivateEventColor(kind),
			"headerColor" : colorHelper.calculateEventHeaderTxtColor(kind)
		};	
	};

	var setNumberOfPeopleAttending = function (people) {
		event.numberOfPeopleAttending = people;
	};

	var setPrivacyLevel = function (privacyLevel) {
		event.privacyLevel.value = privacyLevel;
	};

	var setAddress = function (address) {
		var street = "";
		var city = "";

		if (address) {
			if (address.Street) {
				street = address.Street;
			}
			if (address.City) {
				city = address.City;
			}

			event.address = {
				"street": street,
				"city": city,
				"zipCode": address.ZipCode
		};
	} else {
			event.address = {
				"street": "",
				"city": "",
				"zipCode": ""
			};
		}
	};

	self.getCalendarViewModelEventList = function (userEvents) {
		var serverEvent, userEventsLenght = userEvents.length;
		listOfEvents = [];


		for (var i = 0; i < userEventsLenght; i++) {

			event = new KKEvent();
			serverEvent = userEvents[i];

			setTitle(serverEvent.Title);
			setDescription(serverEvent.Description);
			setDetails(serverEvent.Details);
			setDateAdded(serverEvent.DateAdded);
			setStartDate(serverEvent.StartDate, serverEvent.EventLengthInMinutes);
			setEventLengthInMinutes(serverEvent.EventLengthInMinutes);
			setOccupancyLimit(serverEvent.OccupancyLimit);
			setUrlLink(serverEvent.UrlLink);
			setKind(serverEvent.Kind);
			setNumberOfPeopleAttending(serverEvent.NumberOfPeopleAttending);
			setPrivacyLevel(serverEvent.PrivacyLevel);
			setAddress(serverEvent.Addresses[0]);

			listOfEvents.push(event);

		};

		return listOfEvents;
	};
}