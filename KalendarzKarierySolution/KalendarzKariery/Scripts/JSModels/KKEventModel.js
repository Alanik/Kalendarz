var KKEvent = function () {
	this.title = "";
	this.startDate = {
		startMinute: "",
		endMinute: "",
		startHour: "",
		endHour: "",
		day: "",
		month: "",
		year: ""
	};
	this.privacyLevel = 1;
	this.address = {
		street: "",
		city: "",
		zipCode: ""
	};
	this.description = "";
	this.details = "";
	this.kind = {
		kindName : "",
		color : ""
	};
	this.dateAdded = {
		day : "",
		month : "",
		year : ""
	};
	this.addedBy = "";
	this.numberOfPeopleAttending = "";
	this.occupancyLimit = "";
	this.urlLink = "";
	this.eventLengthInMinutes = 0;
};