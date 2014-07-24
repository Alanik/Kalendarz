var KKEvent = function () {

	var EVENT_COlOR_HELPER = new EventColorHelper();

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

	//kinds
	//	"aktualności"
	//	"wydarzenie"
	//	"zajęcia"
	//	"szkolenie"
	//	"kurs"
	//	"spotkanie"
	//	"inne"

	this.kind = {
		kindName : ko.observable(""),
		color: function () {
			return EVENT_COlOR_HELPER.calculatePrivateEventColor(this.kindName())
		}
	}

	this.numberOfPeopleAttending = 0;

	this.occupancyLimit = null;

	//privacyLevel 
	//	 0 = "private"
	//	 1 = "public" 

	this.privacyLevel =  {
		name : ko.observable(''),
		value : ko.observable('')
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

