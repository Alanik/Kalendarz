﻿var KKEvent = function () {
	var self = this;

	self.addedBy = "";

	self.address = {
		street: "",
		city: "",
		zipCode: ""
	};

	self.calendarPlacementRow = 1;

	self.dateAdded = {
		minute: "",
		hour: "",
		day: "",
		month: "",
		year: ""
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

	self.startDate = {
		javascriptStartDate: "",
		startMinute: "",
		endMinute: "",
		startHour: "",
		endHour: "",
		day: "",
		month: "",
		year: "",
		display: function (time) {
			return time < 10 ? '0' + time : time;
		},
		displayFullDate: function () {
			return this.display(this.day) + '/' + this.display(this.month) + '/' + this.year;
		}
	};

	self.urlLink = "";
};

