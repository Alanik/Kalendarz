var CalendarViewModelConverter = function () {
	var self = this;
	var colorHelper = new EventColorHelper();

	self.getCalendarViewModelEventList = function (calendarEventTreeModel) {
		

		var year = calendarEventTreeModel.Year;
		var month = calendarEventTreeModel.Month;
		var eventsGroupedByDay = calendarEventTreeModel.EventsGroupedByDay;

		// just an example to remember the format of eventTree object
		//var calendarViewModel.eventTree = {
		//	"2013": {},
		//	"2014": {
		//		"8": {
		//			"1": [{}, {}, {}],
		//			"2": [{}, {}],
		//			"3": [{}, {}, {}, {}]
		//		},
		//		"9": {}
		//	},
		//	"2015": {}
		//};

		var listOfEvents = {};
		var event = new KKEvent();

		var groupedByDay, groupedByDayLength, serverEvent, eventGroupsLength = eventGroups.length, tempList;
		
		var setId = function (Id) {
			event.id = id;
		};

		var setTitle = function (title) {
			event.name = title;
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

		/////////////////////////////////////////////////////////

		for (var i = 0; i < eventGroupsLength; i++) {
			groupedByDay = eventGroups[i];
			groupedByDayLength = groupedByDay.length;

			tempList = [];
			

			for (var j = 0; j < groupedByDayLength; j++) {

				serverEvent = groupedByDay[j];

				setId(serverEvent.Id);
				setTitle(serverEvent.name);
				setDescription(serverEvent.Description);
				setDetails(serverEvent.Details);
				setDateAdded(serverEvent.DateAdded);
				setStartDate(serverEvent.StartDate, serverEvent.EventLengthInMinutes);
				setEventLengthInMinutes(serverEvent.EventLengthInMinutes);
				setOccupancyLimit(serverEvent.OccupancyLimit);
				setUrlLink(serverEvent.UrlLink);
				setNumberOfPeopleAttending(serverEvent.NumberOfPeopleAttending);
				setAddress(serverEvent.Addresses[0]);
				setPrivacyLevel(serverEvent.PrivacyLevel);
				setKind(serverEvent.Kind);

				setCalendarPlacementRow(event, j);

				listOfEvents.push(event);
			}

		}

		return listOfEvents;

	};

	self.getCalendarViewModelEventKinds = function (serverEventKinds) {
		var serverEventKind, serverEventKindsLength = serverEventKinds.length;
		var listOfEventKinds = [];
		for (var i = 0; i < serverEventKindsLength; i++) {

			serverEventKind = serverEventKinds[i];
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