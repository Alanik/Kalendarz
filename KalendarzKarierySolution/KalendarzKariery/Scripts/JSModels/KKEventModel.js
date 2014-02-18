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

	//privacyLevel 
	//	 0 = "private"
	//	 1 = "public" 

	this.privacyLevel = function () {
		this.name = ko.observable('');
		this.value = ko.observable('');
	};

	this.address = {
		street: "",
		city: "",
		zipCode: ""
	};
	this.description = "";
	this.details = "";

	//kinds
	//	"aktualności"
	//	"wydarzenie"
	//	"zajęcia"
	//	"szkolenie"
	//	"kurs"
	//	"spotkanie"
	//	"inne"

	this.kind = function(){
		this.kindName = ko.observable(""),
		this.color = ko.observable("")
	}

	this.dateAdded = {
		day: "",
		month: "",
		year: ""
	};
	this.addedBy = "";
	this.numberOfPeopleAttending = "";
	this.occupancyLimit = "";
	this.urlLink = "";
	this.eventLengthInMinutes = 0;


	///constructor
	this.privacyLevel = new this.privacyLevel();
	this.kind = new this.kind();

};

