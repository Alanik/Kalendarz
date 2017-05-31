var KKEventModel = function ()
{
	var self = this;

	//1 string
	self.addedBy = null;
	//2 obj
	self.address = {
		street: null,
		city: null,
		zipCode: null
	};
	//3 int
	self.calendarPlacementRow = 1;
	//4  new KKDateModel()
	self.dateAdded = null;
	//5 string
	self.description = null;
	//6 string
	self.details = null;
	//7 int
	self.eventLengthInMinutes = null;
	//8 obj
	self.kind = {
		value: null,
		name: ko.observable( "" ),
		color: null,
		headerColor: null,
		detailsPageEventBorderColor: null
	};
	//9 string
	self.id = null;
	//10 observable(bool)
	self.isCurrentUserSignedUpForEvent = ko.observable( false );
	//11 observable(bool)
	self.isEventAddedToCurrentUserCalendar = ko.observable( false );
	//12 observable(string)
	self.name = ko.observable( "" );
	//13 num
	self.numberOfPeopleAttending = 0;
	//14 num
	self.occupancyLimit = null;
	//15 obj
	self.privacyLevel = {
		name: null,
		value: null
	};
	//16 num
	self.price = null;
	//17 array 
	self.signedUpUsersForEvent = [];
	//18 new KKEventDateModel()
	self.startDate = null;
	//19 obj
	self.status = {
		name: null,
		value: null
	}
	//20 string
	self.urlLink = null;

	self._isFullAddressDefined = function ()
	{
		var address = self.address;
		if ( address.street !== null && address.city !== null && address.zipCode !== null )
		{
			return "full";
		}
		else if ( address.street === null && address.city === null && address.zipCode === null )
		{
			return "empty";
		}
		else
		{
			return "partial";
		}
	}

	self._isFullDescriptionDefined = function ()
	{
		if ( self.description !== null && self.details !== null )
		{
			return "full";
		}
		else if ( self.description === null && self.details === null )
		{
			return "empty";
		}
		else
		{
			return "partial";
		}
	}
};

