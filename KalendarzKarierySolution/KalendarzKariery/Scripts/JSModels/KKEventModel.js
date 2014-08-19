var KKEvent = function () {
	var self = this;

	this.addedBy = "";

	this.address = {
		street: "",
		city: "",
		zipCode: ""
	};

	this.calendarPlacementRow = 1;

	this.dateAdded = {
		minute: "",
		hour: "",
		day: "",
		month: "",
		year: ""
	};

	this.description = "";

	this.details = "";

	this.eventLengthInMinutes = 0;

	this.kind = {
		value: ko.observable(),
		name: ko.observable(),
		color: "",
		headerColor: ""
	}

	this.id = 0;

	this.numberOfPeopleAttending = 0;

	this.occupancyLimit = null;

	this.privacyLevel = {
		name : "",
		value : ""
	};

	this.startDate = {
		startMinute: "",
		endMinute: "",
		startHour: "",
		endHour: "",
		day: "",
		month: "",
		year: ""
	};

	this.name = "";

	this.urlLink = "";
};

