var KKEvent = function () {
	var self = this;
	var colorHelper = new EventColorHelper();

	this.addedBy = "";

	this.address = {
		street: "",
		city: "",
		zipCode: ""
	};

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

	this.title = "";

	this.urlLink = "";
};

