var KKEvent = function () {
	var self = this;

	self.addedBy = "";

	self.address = {
		street: "",
		city: "",
		zipCode: ""
	};

	self.calendarPlacementRow = 1;

	self.dateAdded = {
		"javascriptDateAdded": "",
		"minute": "",
		"hour": "",
		"day": "",
		"month": "",
		"year": "",
		"formatZero": function (time) {
			return time < 10 ? '0' + time : time;
		},
		"displayFullDate": function () {
			return this.formatZero(this.day) + '/' + this.formatZero(this.month) + '/' + this.year;
		},
		"displayFullTime": function () {
			return this.formatZero(this.hour) + ':' + this.formatZero(this.minute);
		}
	};

	self.description = "";

	self.details = "";

	self.eventLengthInMinutes = 0;

	self.kind = {
		value: "",
		name: ko.observable(""),
		color: "",
		headerColor: "",
		detailsPageEventBorderColor: ""
	}

	self.id = 0;

	self.name = "";

	self.numberOfPeopleAttending = 0;

	self.occupancyLimit = null;

	self.privacyLevel = {
		name: "",
		value: ""
	};

	self.price = null;

	//make sure startDate is same as transformedDate found in function setStartDate of eventTreeBuilder.buildEventTree
	self.startDate = {
		javascriptStartDate: "",
		startMinute: "",
		endMinute: "",
		startHour: "",
		endHour: "",
		day: "",
		month: "",
		year: "",
		formatZero: function (time) {
			return time < 10 ? '0' + time : time;
		},
		displayFullDate: function () {
			return this.formatZero(this.day) + '/' + this.formatZero(this.month) + '/' + this.year;
		},
		//TODO: remove helper functions from model, instead maybe use custom KO bindings
		displayFullTime: function () {
			return this.formatZero(this.startHour) + ':' + this.formatZero(this.startMinute) + " - " + this.formatZero(this.endHour) + ':' + this.formatZero(this.endMinute);
		}
	};

	self.urlLink = "";
};

