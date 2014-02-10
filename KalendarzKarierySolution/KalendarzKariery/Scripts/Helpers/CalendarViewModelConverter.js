var CalendarViewModelConverter = function () {
	var self = this;
	var event;
	var list;

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

	var setStartDate = function (startDate) {
		var dateStr = startDate.replace('T', ' ');
		var date = new Date(Date.parse(dateStr));

		var transformedDate = {
			"startMinute": date.getMinutes(),
			"endMinute": 0,
			"startHour": date.getHours(),
			"endHour": 20,
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
			"kindName": kind,
			"color": calculateColor(kind)
		};

		function calculateColor(kind) {
			switch (kind) {
				case "wydarzenie":
					return "rgb(68, 219, 93)";
				case "zajęcia":
					return "rgb(87, 167, 221)";
				case "szkolenie":
					return "rgb(54, 54, 54)";
				case "kurs":
					return "rgb(219, 219, 21)";
				case "spotkanie":
					return "rgb(253, 104, 170)";
				case 'inne':
					return "rgb(108, 255, 225)";
				default:
					return "rgb(250, 84, 84)";
			}
		};
	};

	var setNumberOfPeopleAttending = function (people) {
		event.numberOfPeopleAttending = people;
	};

	var setPrivacyLevel = function (privacyLevel) {
		event.privacyLevel = privacyLevel;
	};

	var setAddress = function (address) {
		if (address) {
			event.address = {
				"street": address.street,
				"city": address.city,
				"zipCode": address.zipCode
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
		var serverEvent;
		list = [];

		for (var i = 0; i < userEvents.length; i++) {

			event = new KKEvent();
			serverEvent = userEvents[i];

			setTitle(serverEvent.Title);
			setDescription(serverEvent.Description);
			setDetails(serverEvent.Details);
			setDateAdded(serverEvent.DateAdded);
			setStartDate(serverEvent.StartDate);
			setEventLengthInMinutes(serverEvent.EventLengthInMinutes);
			setOccupancyLimit(serverEvent.OccupancyLimit);
			setUrlLink(serverEvent.UrlLink);
			setKind(serverEvent.Kind);
			setNumberOfPeopleAttending(serverEvent.NumberOfPeopleAttending);
			setPrivacyLevel(serverEvent.PrivacyLevel);
			setAddress(serverEvent.Address);

			list.push(event);

		};

		return list;
	};
}