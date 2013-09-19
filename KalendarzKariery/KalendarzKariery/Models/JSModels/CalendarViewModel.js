
function CalendarViewModel(year, month, day) {
	var self = this;
	var $calendar = $("#calendar");

	self.calendarDisplayDate = {
		year: year,
		month: month,
		day: day,
	}

	self.event = {
		date: {
			startMinute: "",
			endMinute : "",
			startHour: "",
			endHour : "",
			day: "",
			month: "",
			year: ""
		},
		scope: "",
		name: "",
		adress: "",
		description: "",
		details: "",
		kind: {
			kindName: "",
			color: ""
		},
		dateAdded: {
			day: "",
			month: "",
			year: ""
		},
		author: ""
	};

	self.dayToDisplay = {
		events: [],
		date: {
			day: "",
			month: "",
			year: ""
		}
	}

	self.events = ko.observableArray([

	]);

	self.filteredEvents = ko.observableArray([

	]);

	self.addEvent = function (event) {

		var date = new Date();

		self.event.dayAdded = date.getDay();

		self.event.kind.color = self.calculateColor(event.kind.kindName);

		self.events.unshift(event);

	}

	self.calculateColor = function (kind) {
		switch (kind) {
			case "Aktualności":
				return "rgb(68, 219, 93)";
			case "Szkolenie":
				return "rgb(87, 167, 221)";
			case "Kurs":
				return "rgb(54, 54, 54)";
			case "Wydarzenie":
				return "rgb(219, 219, 21)";
			case "Spotkanie":
				return "rgb(253, 104, 170)";
			case "Zajęcia":
				return "rgb(108, 255, 225)";
			default:
				return "rgb(250, 84, 84)";
		}
	}

	self.addEventToCalendar = function (event) {

		var cellDay = ".day" + event.date.day;
		var $object = $(cellDay);

		var cellLineStart = ".cell-line" + event.date.startHour;//$("#startHourSelectBox").find(":selected").text();
		var cellLineEnd = ".cell-line" + event.date.endHour;//$("#endHourSelectBox").find(":selected").text();

		var $cellLineStart = $object.find(cellLineStart);
		var $cellLineEnd = $object.find(cellLineEnd);

		var startOffset = parseFloat($cellLineStart.css("left"));
		var endOffset = parseFloat($cellLineEnd.css("left"));

		var width = endOffset - startOffset;

		$("#add-new-event-container").hide();

		var $event = $('<div class="event-rectangle" style="left:' + startOffset + '%; width:' + width + '%; border-color:' + event.kind.color + ' ">' + event.name + '<input type="hidden" name="' + event.name + '" adress="' + event.adress + '" startHour="' + event.date.startHour + '" endHour="' + event.date.endHour + '" ></input></div>');

		$object.append($event);

		$event.fadeTo("slow", .7);
	}

	self.moveToDetailsPageOnCalendarCellClick = function () {



		window.location = "#2";
	}

	self.showNextMonthOnNextMonthBtnClick = function () {

		$calendar.empty();
		self.calendarDisplayDate.month++;

		if (self.calendarDisplayDate.month == 12) {
			self.calendarDisplayDate.year++;
			self.calendarDisplayDate.month = 0;
			$calendar.calendarWidget({ month: self.calendarDisplayDate.month, year: self.calendarDisplayDate.year });
		} else {
			$calendar.calendarWidget({ month: self.calendarDisplayDate.month, year: self.calendarDisplayDate.year });
		}

		ko.unapplyBindings($calendar, false);
		ko.applyBindings(self, $calendar[0]);
	}

	self.showPreviousMonthOnPrevMonthBtnClick = function () {
		$calendar.empty();
		self.calendarDisplayDate.month--;

		if (self.calendarDisplayDate.month == -1) {

			self.calendarDisplayDate.month = 11;
			self.calendarDisplayDate.year--;
			$calendar.calendarWidget({ month: self.calendarDisplayDate.month, year: self.calendarDisplayDate.year });

		} else {
			$calendar.calendarWidget({ month: self.calendarDisplayDate.month, year: self.calendarDisplayDate.year });
		}

		ko.unapplyBindings($calendar, false);
		ko.applyBindings(self, $calendar[0]);
	}

	ko.unapplyBindings = function ($node, remove) {
		// unbind events
		$node.find("*").each(function () {
			$(this).unbind();
		});

		// Remove KO subscriptions and references
		if (remove) {
			ko.removeNode($node[0]);
		} else {
			ko.cleanNode($node[0]);
		}
	};



	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var TestEvent = function (date, scope, name, adress, description, dateAdded, kind, author) {
		this.date = date;
		this.scope = scope;
		this.name = name;
		this.adress = adress;
		this.description = description;
		this.dayAdded = dateAdded;
		this.kind = kind;
		this.author = author;
	};

	var d = new Date();
	var desc = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
	var desc2 = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor in;"

	self.AddTestEvents = function () {
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour : 13, endHour : 14, day: 2, month: 8, year: 2013 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour : 7, endHour : 10, day: 3, month: 8, year: 2013 }, "public", "Bania u Cygana", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Inne", color: "rgb(250, 84, 84)" }, "Admin"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour : 8, endHour : 17, day: 4, month: 8, year: 2013 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour : 16, endHour : 17, day: 2, month: 8, year: 2013 }, "public", "Szkolenie z .Net", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 17, endHour: 21, day: 2, month: 8, year: 2013 }, "public", "Szkolenie z Java", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Andrzej"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 7, endHour: 10, day: 5, month: 8, year: 2013 }, "public", "Spotkanie kola naukowego EniE", "Wroclaw, Politechnika Wroclawska", 8, 12, desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Heniu"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 8, endHour: 13, day: 2, month: 8, year: 2013 }, "public", "Kurs z pimpowania", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 7, endHour: 10, day: 7, month: 8, year: 2013 }, "public", "Ty tez mozesz zostac geekiem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 11, endHour: 15, day: 7, month: 8, year: 2013 }, "public", "Darmowe Browary do rozdania", "Warszwa, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Heniu"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 17, endHour: 21, day: 7, month: 8, year: 2013 }, "public", "Spotkanie organizacyjne", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Spotkanie", color: "rgb(253, 104, 170)" }, "Admin"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 8, endHour: 17, day: 15, month: 8, year: 2013 }, "public", "Majowka", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Sebuś"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 8, endHour: 17, day: 16, month: 9, year: 2013 }, "public", "Warsztaty twojego taty", "Wroclaw, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Alan"));
		self.events.push(new TestEvent({startMinute : "", endMinute : "", startHour: 8, endHour: 17, day: 9, month: 9, year: 2013 }, "public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));

		//self.filteredEvents.push(new TestEvent("public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));
		//self.filteredEvents.push(new TestEvent("public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));
	}

	////////////////////////////////////////////////
	self.AddTestEvents();

	self.calendarDisplayDate = { day: 18, month: 8, year: 2013 };

	ko.utils.arrayForEach(self.events(), function (event) {
		if (event.date.month === self.calendarDisplayDate.month && event.date.year === self.calendarDisplayDate.year) {
	//		self.addEvent(event);
			self.addEventToCalendar(event);
		}

	});
}

