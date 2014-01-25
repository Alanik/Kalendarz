
function CalendarViewModel(year, month, day) {
	var self = this;

	self.calendarPageDisplayDate = {
		year: year,
		month: month,
		day: day
	};

	self.privacyLevels = {
		"public": 1,
		"private": 2
	};

	self.event = {
		title: "",
		date: {
			startMinute: "",
			endMinute: "",
			startHour: "",
			endHour: "",
			day: "",
			month: "",
			year: ""
		},
		privacyLevel: "",
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
		addedBy: ""
	};

	self.detailsPageDayToDisplay = {
		events: [],
		date: {
			day: "",
			month: "",
			year: ""
		}
	};

	self.events = ko.observableArray([

	]);

	self.filteredEvents = ko.observableArray([

	]);

	self.getEventsFromMonth = function (month, year) {
		return ko.utils.arrayFilter(self.events(), function(item) {
			return item.date.month === month && item.date.year === year;
		});
	};

	self.getEventsFromDay = function (eventsInMonth, day) {
		var intDay = parseInt(day);

		return ko.utils.arrayFilter(eventsInMonth, function(item) {
			return item.date.day === intDay;
		});
	};

	self.addEventOnClick = function(privacyLevel) {

		//var date = new Date();
		//self.event.dayAdded = date.getDay();
		//self.event.kind.color = self.calculateColor(event.kind.kindName);
		//self.events.unshift(event);

		var $addEventForm = $("#addEventForm");
		var action = $addEventForm.attr("action");

		$addEventForm.validate().form();
		$addEventForm.removeAttr("novalidate");

		if ($addEventForm.valid()) {

			var startHourWithMinutes = $("#eventStartHourTxtBox").val();
			var endHourWithMinutes = $("#eventEndHourTxtBox").val();
			var startDayMonthYear = $("#Event_StartDate").val();

			var startTime = startHourWithMinutes.split(":");
			var startHour = startTime[0];
			var startMinute = startTime[1];
			var startDateArray = startDayMonthYear.split("/");

			var endEventDate = new Date();
			var endTime = endHourWithMinutes.split(":");
			var endHour = endTime[0];
			var endMinute = endTime[1];

			var startEventDate = new Date();

			startEventDate.setMinutes(parseInt(startMinute));
			startEventDate.setHours(parseInt(startHour));

			startEventDate.setDate(parseInt(startDateArray[0]));
			startEventDate.setMonth(parseInt(startDateArray[1]));
			startEventDate.setYear(parseInt(startDateArray[2]));

			endEventDate.setMinutes(parseInt(endMinute));
			endEventDate.setHours(parseInt(endHour));
			endEventDate.setDate(parseInt(startDateArray[0]));
			endEventDate.setMonth(parseInt(startDateArray[1]));
			endEventDate.setYear(parseInt(startDateArray[2]));

			$("#eventStartHourTxtBox").val(startEventDate);


			var diff = Math.abs(startEventDate - endEventDate);
			var minutes = Math.floor((diff / 1000) / 60);

			$.ajax({
				url: action,
				type: "POST",
				data: $addEventForm.serialize() + "&Event.EventLengthInMinutes=" + minutes,
				success: function(result) {
					if (result.isAddEventSuccess === false) {
						alert("Nie udalo sie dodac wydarzenia!");
					} else {
						alert("dodane");
					}
				},
				error: function() {
					alert("Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz.");
				}
			});
		}

		return false;
	};

	self.calculateColor = function(kind) {
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
	};

	self.addEventToCalendar = function(event) {
		$("#add-new-event-container").hide();

		var cellDay = ".day" + event.date.day;
		var $placeholder = $(cellDay).find(".calendar-cell-placeholder");
		var cellLineStart = ".cell-line" + event.date.startHour; //$("#startHourSelectBox").find(":selected").text();
		var cellLineEnd = ".cell-line" + event.date.endHour; //$("#endHourSelectBox").find(":selected").text();

		var $cellLineStart = $placeholder.find(cellLineStart);
		var $cellLineEnd = $placeholder.find(cellLineEnd);

		var startOffset = parseFloat($cellLineStart.css("left"));
		var endOffset = parseFloat($cellLineEnd.css("left"));

		var width = endOffset - startOffset;

		var $event = $('<div class="event-rectangle" style="left:' + startOffset + '%; width:' + width + '%; border-color:' + event.kind.color + ' ">' + event.name + '<input type="hidden" name="' + event.name + '" adress="' + event.adress + '" startHour="' + event.date.startHour + '" endHour="' + event.date.endHour + '" ></input></div>');

		$placeholder.append($event);

		$event.fadeTo("slow", .7);
	};

	self.addEventToDetailsDay = function(event) {
		var $hourCell = $(".hour-cell-" + event.date.startHour);
		var startMinuteOffset = event.date.startMinute / 60 * 100;
		var endMinuteOffset = event.date.endMinute / 60 * 100;
		var width = ((event.date.endHour - event.date.startHour) * 100) - startMinuteOffset + endMinuteOffset;

		$hourCell.append('<div class="event-rectangle-details" style="width:' + width + '%;left:' + startMinuteOffset + '%;border-color:' + event.kind.color + ';"><span>' + event.name + '</span></div>');
	};

	self.removeEventRectanglesFromDetailsDay = function() {
		var $calendar = $("#calendarDayDetailsTable");
		$calendar.find(".event-rectangle-details").remove();
	};

	self.moveToDetailsPageOnCalendarCellClick = function(element) {
		self.removeEventRectanglesFromDetailsDay();

		var day = $(element).attr("dayNumber");
		var monthEvents = self.getEventsFromMonth(self.calendarDisplayDate.month, self.calendarDisplayDate.year);
		var dayEvents = self.getEventsFromDay(monthEvents, day);

		for (var i in dayEvents) {
			self.addEventToDetailsDay(dayEvents[i]);
		}

		window.location = "#2";
	};

	self.showNextMonthOnNextMonthBtnClick = function () {
		var $calendar = $("#calendar");

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

		var eventsInMonth = self.getEventsFromMonth(self.calendarDisplayDate.month, self.calendarDisplayDate.year);

		//draw to calendar
		ko.utils.arrayForEach(eventsInMonth, function (event) {
			if (event.date.month === self.calendarDisplayDate.month && event.date.year === self.calendarDisplayDate.year) {
				self.addEventToCalendar(event);
			}
		});
	}

	self.showPreviousMonthOnPrevMonthBtnClick = function() {
		var $calendar = $("#calendar");
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

		var eventsInMonth = self.getEventsFromMonth(self.calendarDisplayDate.month, self.calendarDisplayDate.year);

		//draw to calendar
		ko.utils.arrayForEach(eventsInMonth, function(event) {
			if (event.date.month === self.calendarDisplayDate.month && event.date.year === self.calendarDisplayDate.year) {
				self.addEventToCalendar(event);
			}
		});

	};

	self.showRegisterFormOnClick = function() {
		var $loginForm = $("#loginPageContainer");
		var $registerForm = $("#registerPageContainer");

		$loginForm.slideUp();
		$registerForm.slideDown();

	};

	self.showLoginFormOnClick = function() {
		var $loginForm = $("#loginPageContainer");
		var $registerForm = $("#registerPageContainer");

		$registerForm.slideUp();
		$loginForm.slideDown()

		document.querySelector('#lobby-menu-header').scrollIntoView();
	};

	self.loginUserOnClick = function() {

		var $loginForm = $("#loginForm");
		var action = $loginForm.attr("action");

		$loginForm.validate().form();

		if ($loginForm.valid()) {
			$.ajax({
				url: action,
				type: "POST",
				data: $loginForm.serialize(),
				success: function(result) {

					if (result.validationError) {
						alert("Nazwa użytkownika lub hasło jest nieprawidłowe");
					} else {
						window.location = "/home";
					}
				},
				error: function() {
					alert("Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz.");
				}
			});
		}

		return false;
	};

	self.registerUserOnClick = function() {

		var $registerForm = $("#registerForm");
		$registerForm.find(".summary-validation-errors").empty();
		var action = $registerForm.attr("action");

		$registerForm.validate().form();

		if ($registerForm.valid()) {
			$.ajax({
				url: action,
				type: "POST",
				data: $registerForm.serialize(),
				success: function(result) {
					if (result.isRegisterSuccess === false) {
						displayErrors(result.errors);
					} else {
						window.location = "/home";
					}
				},
				error: function() {
					alert("Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz.");
				}
			});
		};

		return false;

		function displayErrors(errors) {
			var label;
			var error;

			for (var i = 0; i < errors.length; i++) {
				error = errors[i];

				if (error.Key === "") {
					$registerForm.find(".summary-validation-errors").append("<div>" + error.Value[0] + "</div>");
				} else {
					label = $registerForm.find("input[name = '" + error.Key + "']").removeClass("valid").addClass("input-validation-error").next().removeClass("field-validation-valid").addClass("field-validation-error");
					label.html(error.Value[0]);
				}
			}
		}

	};

	self.slideDownMenuOptionsOnClick = function(element) {

		var $tabElement = $(element);
		$tabElement.toggleClass("menu-dropdown-visible");
		var $optionsContainer = $tabElement.siblings(".menu-item-dropdown-container");

		if ($tabElement.hasClass("menu-dropdown-visible")) {
			$optionsContainer.slideDown();
		} else {
			$optionsContainer.slideUp();
		}
	};

	self.showAddPublicEventPageOnClick = function(element) {

		var eventKind = $(element).parent().siblings(".menu-item").attr("name");
		var $addEventContainer = $("#add-new-event-container");

		$addEventContainer.css({
			"top": "170px",
			"width": "70%",
			"left": "15%"
		});
		$addEventContainer.appendTo(".lobby-content-container");
		$addEventContainer.fadeIn();
		document.querySelector('#add-new-event-container').scrollIntoView();
	};

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
	var TestEvent = function (date, privacyLevel, title, adress, description, dateAdded, kind, addedBy) {
		this.date = date;
		this.privacyLevel = privacyLevel;
		this.title = title;
		this.adress = adress;
		this.description = description;
		this.dayAdded = dateAdded;
		this.kind = kind;
		this.addedBy = addedBy;
	};

	var d = new Date();
	var desc = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
	var desc2 = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor in;"

	self.AddTestEvents = function() {
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 13, endHour: 14, day: 2, month: 11, year: 2013 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 3, month: 11, year: 2013 }, "public", "Bania u Cygana", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Inne", color: "rgb(250, 84, 84)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 4, month: 11, year: 2013 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 16, endHour: 17, day: 2, month: 11, year: 2013 }, "public", "Szkolenie z .Net", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 2, month: 11, year: 2013 }, "public", "Szkolenie z Java", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Andrzej"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 5, month: 11, year: 2013 }, "public", "Spotkanie kola naukowego EniE", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 13, day: 2, month: 11, year: 2013 }, "public", "Kurs z pimpowania", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 7, month: 11, year: 2013 }, "public", "Ty tez mozesz zostac geekiem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 11, endHour: 15, day: 7, month: 11, year: 2013 }, "public", "Darmowe Browary do rozdania", "Warszwa, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 7, month: 11, year: 2013 }, "public", "Spotkanie organizacyjne", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Spotkanie", color: "rgb(253, 104, 170)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 15, month: 11, year: 2013 }, "public", "Majowka", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Sebuś"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 16, month: 11, year: 2013 }, "public", "Warsztaty twojego taty", "Wroclaw, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Alan"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 9, month: 11, year: 2013 }, "public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));

		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 13, endHour: 14, day: 5, month: 11, year: 2013 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 5, month: 11, year: 2013 }, "public", "Bania u Cygana", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Inne", color: "rgb(250, 84, 84)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 11, month: 11, year: 2013 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 16, endHour: 17, day: 11, month: 11, year: 2013 }, "public", "Szkolenie z .Net", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 11, month: 11, year: 2013 }, "public", "Szkolenie z Java", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Andrzej"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 12, month: 11, year: 2013 }, "public", "Spotkanie kola naukowego EniE", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 13, day: 12, month: 11, year: 2013 }, "public", "Kurs z pimpowania", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 14, month: 11, year: 2013 }, "public", "Ty tez mozesz zostac geekiem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 11, endHour: 15, day: 14, month: 11, year: 2013 }, "public", "Darmowe Browary do rozdania", "Warszwa, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 18, month: 11, year: 2013 }, "public", "Spotkanie organizacyjne", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Spotkanie", color: "rgb(253, 104, 170)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 21, month: 11, year: 2013 }, "public", "Majowka", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Sebuś"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 22, month: 11, year: 2013 }, "public", "Warsztaty twojego taty", "Wroclaw, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Alan"));
		self.events.push(new TestEvent({ startMinute: 30, endMinute: 48, startHour: 8, endHour: 17, day: 23, month: 11, year: 2013 }, "public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));

		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 13, endHour: 14, day: 9, month: 11, year: 2013 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 9, month: 11, year: 2013 }, "public", "Bania u Cygana", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Inne", color: "rgb(250, 84, 84)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 10, month: 11, year: 2013 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: 10, endMinute: 20, startHour: 12, endHour: 17, day: 6, month: 11, year: 2013 }, "public", "Szkolenie z .Net", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Zajęcia", color: "rgb(108, 255, 225)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 25, month: 11, year: 2013 }, "public", "Szkolenie z Java", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Andrzej"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 26, month: 10, year: 2013 }, "public", "Spotkanie kola naukowego EniE", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 13, day: 27, month: 10, year: 2013 }, "public", "Kurs z pimpowania", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 28, month: 10, year: 2013 }, "public", "Ty tez mozesz zostac geekiem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: 30, endMinute: 55, startHour: 11, endHour: 15, day: 29, month: 10, year: 2013 }, "public", "Darmowe Browary do rozdania", "Warszwa, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Heniu"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 30, month: 10, year: 2013 }, "public", "Spotkanie organizacyjne", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Spotkanie", color: "rgb(253, 104, 170)" }, "Admin"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 30, month: 10, year: 2013 }, "public", "Majowka", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Sebuś"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 18, month: 10, year: 2013 }, "public", "Warsztaty twojego taty", "Wroclaw, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2013 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Alan"));
		self.events.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 19, month: 10, year: 2013 }, "public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2013 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));
	};

	////////////////////////////////////////////////
	var date = new Date();

	self.calendarDisplayDate = { day: 7, month: date.getMonth(), year: 2013 };
	self.detailsDayToDisplay = { day: 23, month: 8, year: 2013 };

	self.AddTestEvents();

	var eventsInMonth = self.getEventsFromMonth(self.calendarDisplayDate.month, self.calendarDisplayDate.year);

	//draw to calendar
	ko.utils.arrayForEach(eventsInMonth, function (event) {
		if (event.date.month === self.calendarDisplayDate.month && event.date.year === self.calendarDisplayDate.year) {
			self.addEventToCalendar(event);
		}
	});

	var eventsInToday = self.getEventsFromDay(eventsInMonth, self.calendarDisplayDate.day);

	for (var i in eventsInToday) {
		self.addEventToDetailsDay(eventsInToday[i]);
	}
}

