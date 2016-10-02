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
		} else
		{
			return "white";
		}
	};

	self.getEventBoxHeaderColor = function (kindValue) {
		switch (kindValue) {
			case 1:
				return "rgb(251, 251, 54)";
			case 2:
				return "rgb(255, 181, 43)";
			case 3:
				return "rgb(5, 199, 255)";
			case 4:
				return "rgb(85, 133, 255)";
			case 5:
				return "rgb(200, 200, 200)";
			case 6:
				return "rgb(116, 210, 143)";
			case 7:
				return "rgb(255, 114, 114)";
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

