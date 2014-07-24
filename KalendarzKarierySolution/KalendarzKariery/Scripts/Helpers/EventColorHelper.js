var EventColorHelper = function () {
	var self = this;
	self.calculatePrivateEventColor = function calculatePrivateEventColor(kindName) {
		switch (kindName) {
			case "wydarzenie":
				return "#ffff84";
			case "zajęcia":
				return "rgb(107, 223, 199)";
			case "szkolenie":
				return "#57a7dd";
			case "kurs":
				return "#919191";
			case "spotkanie":
				return "#ffb6d7";
			case 'inne':
				return "#fa5454";
			default:
				return "rgb(250, 84, 84)";
		}
	};

	self.calculatePublicEventColor = function calculatePublicEventColor(kindName) {
		switch (kindName) {
			case "wydarzenie":
				return "rgb(68, 219, 93)";
			case "zajęcia":
				return "rgb(87, 167, 221)";
			case "szkolenie":
				return "rgb(219, 219, 21)";
			case "kurs":
				return "rgb(54, 54, 54)";
			case "spotkanie":
				return "rgb(253, 104, 170)";
			case 'inne':
				return "rgb(108, 255, 225)";
			default:
				return "rgb(250, 84, 84)";
		}
	};
};

