var CalendarViewModelConverter = function () {
	var self = this;
	var colorHelper = new EventColorHelper();

	var event = new KKEvent();
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

	var setPrivacyLevel = function (privacyLevel) {
		event.privacyLevel = privacyLevel;
	};

	var setOccupancyLimit = function (limit) {
		event.occupancyLimit = limit;
	};

	var setUrlLink = function (url) {
		event.urlLink = url;
	};

	var setKind = function (kind) {
		event.kind.name(kind.name);
		event.kind.value(kind.value);
		event.kind.color = colorHelper.calculatePrivateEventColor(kind.value);
		event.kind.headerColor = colorHelper.calculateEventHeaderTxtColor(kind.value);
	};

	var setNumberOfPeopleAttending = function (people) {
		event.numberOfPeopleAttending = people;
	};

	var setPrivacyLevel = function (privacyLevel) {
		event.privacyLevel = privacyLevel;
	};

	var setAddress = function (address) {
		event.address = address;

		if (typeof address == 'undefined' || !address) {
			event.address = {
				street: "",
				city: "",
				zipCode: ""
			};
		}
	};

	self.getCalendarViewModelEventList = function (userEvents) {
		var serverEvent, userEventsLength = userEvents.length;
		listOfEvents = [];

		for (var i = 0; i < userEventsLength; i++) {

			event = new KKEvent();
			serverEvent = userEvents[i];

			setTitle(serverEvent.title);
			setDescription(serverEvent.description);
			setDetails(serverEvent.details);
			setDateAdded(serverEvent.dateAdded);
			setStartDate(serverEvent.startDate, serverEvent.eventLengthInMinutes);
			setEventLengthInMinutes(serverEvent.eventLengthInMinutes);
			setOccupancyLimit(serverEvent.occupancyLimit);
			setUrlLink(serverEvent.urlLink);
			setNumberOfPeopleAttending(serverEvent.numberOfPeopleAttending);
			setAddress(serverEvent.addresses[0]);
			setPrivacyLevel(serverEvent.privacyLevel);
			setKind(serverEvent.kind);

			listOfEvents.push(event);

		};

		return listOfEvents;
	};

	self.getCalendarViewModelEventKinds = function (serverEventKinds) {
		var serverEventKind, serverEventKindsLength = serverEventKinds.length;
		var listOfEventKinds = [];
		for (var i = 0; i < serverEventKindsLength; i++) {

			serverEventKind = serverEventKinds[i];
			//serverEventKind.color = colorHelper.calculatePrivateEventColor(serverEventKind.value);
			//serverEventKind.headerColor = colorHelper.calculateEventHeaderTxtColor(serverEventKind.value);
			
			listOfEventKinds.push(serverEventKind);
		};

		return listOfEventKinds;
	};

	self.getCalendarViewModelPrivacyLevels = function (serverPrivacyLevels) {
		var serverPrivacyLevel, serverPrivacyLevelsLength = serverPrivacyLevels.length;
		var listOfPrivacyLevel = [];
		for (var i = 0; i < serverPrivacyLevelsLength; i++) {

			listOfPrivacyLevels.push(serverPrivacyLevels[i]);

		};

		return listOfPrivacyLevels;
	};
};