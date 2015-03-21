var EventFactory = function(){
	var self = this;

	self.getKKEventModel = function (addedBy, street, city, zipCode, description, details, minutes, kindValue, kindName, eventId, occupancyLimit, privacyLevelName, privacyLevelValue, startDate, name, urlLink, price){
		var date = new Date();
		var colorHelper = new EventColorHelper();

		var kkEventModel = new KKEventModel();

		kkEventModel.addedBy = addedBy;
		kkEventModel.address.street = street;
		kkEventModel.address.city = city;
		kkEventModel.address.zipCode = zipCode;	
		//TODO: Get dateAdded from server
		kkEventModel.dateAdded = new KKDateModel(date, date.getMinutes(), date.getHours(), date.getDate(), parseInt(date.getMonth(), 10) + 1, date.getFullYear());
		kkEventModel.description = description;
		kkEventModel.details = details;
		kkEventModel.eventLengthInMinutes = minutes;
		kkEventModel.kind.value = kindValue;
		kkEventModel.kind.name = kindName;

		if (privacyLevelValue == 1) {
			kkEventModel.kind.color = colorHelper.calculatePrivateEventColor( kkEventModel.kind.value );
		}
		else {
			kkEventModel.kind.color = colorHelper.calculatePublicEventColor( kkEventModel.kind.value );
		}

		kkEventModel.kind.headerColor = colorHelper.calculateEventHeaderTxtColor( kkEventModel.kind.value );
		kkEventModel.kind.detailsPageEventBorderColor = colorHelper.calculateEventDetailsBorderColor( kkEventModel.kind.value );
		kkEventModel.id = eventId; 
		kkEventModel.occupancyLimit = occupancyLimit;
		kkEventModel.privacyLevel.name = privacyLevelName;
		kkEventModel.privacyLevel.value = privacyLevelValue;
		kkEventModel.startDate = startDate;
		kkEventModel.name = name;
		kkEventModel.urlLink = urlLink;
		kkEventModel.price = price;

		return kkEventModel;
	};



};