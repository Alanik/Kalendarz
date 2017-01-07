var KKEventModelObservable = function ()
{
	var self = this;

	//1
	self.addedBy = ko.observable("");
	//2
	self.address = {
		street: ko.observable( "" ),
		city: ko.observable( "" ),
		zipCode: ko.observable( "" )
	};
	//3
	self.dateAdded = new KKDateModel( 0, 0, 0, 0, 0 );
	//4
	self.description = ko.observable( "" );
	//5
	self.details = ko.observable( "" );
	//6
	self.kind = {
		value: ko.observable( "" ),
		name: ko.observable( "" ),
		color: "",
		headerColor: "",
		detailsPageEventBorderColor: ""
	}
	//7
	self.id = 0;
	//8
	self.isCurrentUserSignedUpForEvent = false;
	//9
	self.isEventAddedToCurrentUserCalendar = false;
	//10
	self.name = ko.observable( "" );
	//11
	self.numberOfPeopleAttending = ko.observable( 0 );
	//12
	self.occupancyLimit = ko.observable( null );
	//13
	self.privacyLevel = {
		name: "",
		value: ""
	};
	//14
	self.price = ko.observable( null );
	//15
	self.startDate = new KKEventDateModelObservable( 0, 0, 0, 0, 0, 0, 0 ); // new KKEventDateModelObservable();
	//16
	self.urlLink = ko.observable( "" );
};

