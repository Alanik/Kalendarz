var KKEventModel = function () {
	var self = this;

	self.addedBy = "";

	self.address = {
		street: "",
		city: "",
		zipCode: ""
	};

	self.calendarPlacementRow = 1;

	self.dateAdded = {}; // = new KKDateModel()

	self.description = "";

	self.details = "";

	self.eventLengthInMinutes = 0;

	self.kind = {
		value: "",
		name: ko.observable( "" ),
		color: "",
		headerColor: "",
		detailsPageEventBorderColor: ""
	};

	self.id = 0;

	self.isCurrentUserSignedUpForEvent = ko.observable(false);

	self.isEventAddedToCurrentUserCalendar = ko.observable(false);

	self.name = ko.observable("");

	self.numberOfPeopleAttending = 0;

	self.occupancyLimit = null;

	self.privacyLevel = {
		name: "",
		value: ""
	};

	self.price = null;

	self.signedUpUsersForEvent = [];

	self.startDate = {} // new KKEventDateModel();

	self.urlLink = "";
};

