
function CalendarViewModel() {
	var self = this;

	self.event = {
		scope: "",
		name: "",
		adress: "",
		startTime: "",
		endTime: "",
		description: "",
		details: "",
		dayAdded: "",
		dateAdded: "",
		kind: {
			kindName: "",
			color: ""
		},
		author: ""
	};

	self.events = ko.observableArray([

	]);

	self.filteredEvents = ko.observableArray([

	]);

	self.addEvent = function () {
		var date = new Date();

		self.event.dayAdded = date.getDay();

		self.event.kind.color = calculateColor(self.event.kind.kindName);

		self.events.unshift(self.event);

		console.log(self.event);

		AddToCalendar();

		function calculateColor(kind) {
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

		function AddToCalendar() {

			var dayNumber = $("#hiddenDay").attr("name");

			var cellDay = ".day" + dayNumber;

			var $object = $(cellDay);

			var cellLineStart = ".cell-line" + $("#startHourSelectBox").find(":selected").text();
			var cellLineEnd = ".cell-line" + $("#endHourSelectBox").find(":selected").text();

			var leftOffset = $object.find(cellLineStart).css("left");

			var startWidth = $object.find(cellLineStart).offset().left;
			var endWidth = $object.find(cellLineEnd).offset().left;
			var width = endWidth - startWidth;

			$("#add-new-event-container").hide();

			var $event = $('<div class="event-rectangle" style="left:' + leftOffset + '; width:' + width + 'px; border-color:' + self.event.kind.color +' "><input type=hidden name=' + self.event.name + ' adress=' + self.event.adress + ' startHour=' + self.event.startTime + ' endHour=' + self.event.endTime + ' ></input></div>');

			$object.append($event);
			$event.fadeTo("slow",.7);
		};
	}

	self.showContentOnTabClk = function(){
	


	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var TestEvent = function (scope, name, adress, startTime, endTime, description, dayAdded, kind, author) {
		this.scope = scope;
		this.name = name;
		this.adress = adress;
		this.startTime = startTime;
		this.endTime = endTime;
		this.description = description;
		this.dayAdded = dayAdded;
		this.kind = kind;
		this.author = author;
	};

	var d = new Date();
	var desc = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
	var desc2 = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor in;"

	self.AddTestEvents = function () {
		self.events.push(new TestEvent("public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent("public", "Bania u Cygana", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Inne", color: "rgb(250, 84, 84)" }, "Admin"));
		self.events.push(new TestEvent("public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent("public", "Szkolenie z .Net", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent("public", "Szkolenie z Java", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Andrzej"));
		self.events.push(new TestEvent("public", "Spotkanie kola naukowego EniE", "Wroclaw, Politechnika Wroclawska", 8, 12, desc2, d.getDay(), { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Heniu"));
		self.events.push(new TestEvent("public", "Kurs z pimpowania", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent("public", "Ty tez mozesz zostac geekiem", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent("public", "Darmowe Browary do rozdania", "Warszwa, Politechnika Wroclawska", 8, 12, desc2, d.getDay(), { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Heniu"));
		self.events.push(new TestEvent("public", "Spotkanie organizacyjne", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Spotkanie", color: "rgb(253, 104, 170)" }, "Admin"));
		self.events.push(new TestEvent("public", "Majowka", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Sebuś"));
		self.events.push(new TestEvent("public", "Warsztaty twojego taty", "Wroclaw, Politechnika Wroclawska", 8, 12, desc2, d.getDay(), { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Alan"));
		self.events.push(new TestEvent("public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));

		self.filteredEvents.push(new TestEvent("public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));
		self.filteredEvents.push(new TestEvent("public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", 8, 12, desc, d.getDay(), { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));
	}

	////////////////////////////////////////////////
	self.AddTestEvents();
}

ko.applyBindings(new CalendarViewModel());