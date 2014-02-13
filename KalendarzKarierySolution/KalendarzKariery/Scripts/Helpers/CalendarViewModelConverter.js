var CalendarViewModelConverter = function (evColHelper) {
	var self = this;
	var colorHelper = evColHelper;

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

	var setStartDate = function (startDate, length) {
		var dateStr = startDate.replace('T', ' ');
		var date = new Date(Date.parse(dateStr));

		var h = date.getHours();

		var minutes = (length % 60);
		var hours = (length - minutes) / 60;

		var transformedDate = {
			"startMinute": date.getMinutes(),
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
			"kindName": kind,
			"color":  colorHelper.calculatePrivateEventColor(kind)
		};

		
	};

	var setNumberOfPeopleAttending = function (people) {
		event.numberOfPeopleAttending = people;
	};

	var setPrivacyLevel = function (privacyLevel) {
		event.privacyLevel = privacyLevel;
	};

	var setAddress = function (address) {
		var street = "";
		var city = "";

		console.log("address");
		console.log(address);

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
		console.log(userEvents);
		var serverEvent;
		list = [];

		for (var i = 0; i < userEvents.length; i++) {

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

			list.push(event);

		};

		return list;
	};
}