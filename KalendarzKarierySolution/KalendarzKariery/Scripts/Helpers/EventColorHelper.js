var EventColorHelper = function () {
	var self = this;

	//1 = wydarzenie
	//2 = lekcje
	//3 = zajęcia
	//4 = szkolenie
	//5 = kurs
	//6 = spotkanie
	//7 = inne

	self.getEventColor = function ( privacyLvlValue, kindValue )
	{
		if ( privacyLvlValue == 1 )
		{
			switch ( kindValue )
			{
				case 1:
					return "rgb(255, 255, 196)";
				case 2:
					return "rgb(255, 232, 189)";
				case 3:
					return "rgb(193, 241, 255)";
				case 4:
					return "rgb(185, 205, 255)";
				case 5:
					return "rgb(200, 200, 200)";
				case 6:
					return "rgb(194, 255, 212)";
				case 7:
					return "rgb(255, 204, 204)";
				default:
					return "white";
			}
		} else if ( privacyLvlValue == 2 )
		{
			switch ( kindValue )
			{
				case 1:
					return "rgb(68, 219, 93)";
				case 2:
					return "rgb(255, 215, 141)";
				case 3:
					return "rgb(87, 167, 221)";
				case 4:
					return "rgb(219, 219, 21)";
				case 5:
					return "rgb(54, 54, 54)";
				case 6:
					return "rgb(253, 104, 170)";
				case 7:
					return "rgb(108, 255, 225)";
				default:
					return "white";
			}
		} else
		{
			return "white";
		}
	};

	self.getEventBoxHeaderColor = function (kindValue) {
		switch (kindValue) {
			case 1:
				return "rgb(255, 255, 196)";
			case 2:
				return "rgb(255, 232, 189)";
			case 3:
				return "rgb(193, 241, 255)";
			case 4:
				return "rgb(185, 205, 255)";
			case 5:
				return "rgb(200, 200, 200)";
			case 6:
				return "rgb(194, 255, 212)";
			case 7:
				return "rgb(255, 204, 204)";
			default:
				return "white";
		}
	};

	self.getEventDetailsBorderColor = function (kindValue) {
		switch ( kindValue )
		{
			case 1:
				return "rgb(255, 255, 196)";
			case 2:
				return "rgb(255, 232, 189)";
			case 3:
				return "rgb(193, 241, 255)";
			case 4:
				return "rgb(185, 205, 255)";
			case 5:
				return "rgb(200, 200, 200)";
			case 6:
				return "rgb(194, 255, 212)";
			case 7:
				return "rgb(255, 204, 204)";
			default:
				return "white";
		}
	};
};

