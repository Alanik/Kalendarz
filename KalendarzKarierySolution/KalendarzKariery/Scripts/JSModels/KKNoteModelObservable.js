var KKNoteModelObservable = function ()
{
	var self = this;

	self.id = 0;

	self.data = ko.observable("");

	self.dateAdded = {}; // new KKDateModel()

	self.addedBy = "";

	self.privacyLevel = {
		name: "",
		value: ""
	};

	self.displayDate = {}; // new KKDateModel()

	self.isLineThrough = ko.observable( false );
};

