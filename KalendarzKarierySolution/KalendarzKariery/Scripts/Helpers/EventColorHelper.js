var EventColorHelper = function () {
	var self = this;
	
	//1 = wydarzenie
	//2 = zajęcia
	//3 = szkolenie
	//4 = kurs
	//5 = spotkanie
	//6 = inne

	self.calculatePrivateEventColor = function calculatePrivateEventColor(kindValue) {

		switch (kindValue) {
			case 1:
				return "#ffff84";
			case 2:
				return "rgb(107, 223, 199)";
			case 3:
				return "#57a7dd";
			case 4:
				return "#919191";
			case 5:
				return "#ffb6d7";
			case 6:
				return "#fa5454";
			default:
				return "black";
		}
	};

	self.calculatePublicEventColor = function calculatePublicEventColor(kindValue) {
		switch (kindValue) {
			case 1:
				return "rgb(68, 219, 93)";
			case 2:
				return "rgb(87, 167, 221)";
			case 3:
				return "rgb(219, 219, 21)";
			case 4:
				return "rgb(54, 54, 54)";
			case 5:
				return "rgb(253, 104, 170)";
			case 6:
				return "rgb(108, 255, 225)";
			default:
				return "rgb(250, 84, 84)";
		}
	};

	self.calculateEventHeaderTxtColor = function calculateEventHeaderTxtColor(kindValue) {
		switch (kindValue) {
			case 1:
				return "#ffff84";
			case 2:
				return "rgb(146, 248, 227)";
			case 3:
				return "rgb(165, 218, 255)";
			case 4:
				return "rgb(221,221,221)";
			case 5:
				return "rgb(255, 202, 226)";
			case 6:
				return "rgb(255, 136, 136)";
			default:
				return "rgb(250, 84, 84)";
		}
	};
};

