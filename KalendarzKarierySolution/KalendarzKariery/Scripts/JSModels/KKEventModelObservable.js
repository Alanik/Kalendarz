var KKEventModelObservable = function ()
{
	var self = this;

	self.addedBy = ko.observable("");

	self.address = {
		street: ko.observable( "" ),
		city: ko.observable( "" ),
		zipCode: ko.observable( "" )
	};

	self.dateAdded = new KKDateModel( null, 0, 0, 0, 0, 0 );

	self.description = ko.observable( "" );

	self.details = ko.observable( "" );

	self.kind = {
		value: ko.observable( "" ),
		name: ko.observable( "" ),
		color: "",
		headerColor: "",
		detailsPageEventBorderColor: ""
	}

	self.id = 0;

	self.name = ko.observable( "" );

	self.numberOfPeopleAttending = ko.observable( 0 );

	self.occupancyLimit = ko.observable( null );

	self.privacyLevel = {
		name: "",
		value: ""
	};

	self.price = ko.observable( null );

	self.startDate = new KKEventDateModelObservable( null, 0, 0, 0, 0, 0, 0, 0 ); // new KKEventDateModelObservable();

	self.urlLink = ko.observable( "" );
};

