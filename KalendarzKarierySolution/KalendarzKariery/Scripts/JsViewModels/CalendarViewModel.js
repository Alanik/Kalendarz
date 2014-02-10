
function CalendarViewModel(year, month, day) {
	var self = this;

	self.event = new KKEvent();

	self.privacyLevels = {
		"public" : 1,
		"private" : 2
	};

	self.kinds = [
		"aktualności",
		"wydarzenie",
		"zajęcia",
		"szkolenie",
		"kurs",
		"spotkanie",
		"inne"
	];

	self.detailsPageDisplayDate = {
		events: [],
		date: {
			"day" : "",
			"month" : "",
			"year" : ""
		}
	};

	self.calendarPageDisplayDate = {
		"year" : year,
		"month" : month,
		"day" : day
	};

	self.AddNewEvent_Day = 0;

	//self.calendarPageMonthEvents = ko.observableArray([
	//]);

	//self.userPrivateEvents = ko.observableArray([
	//]);

	//self.publicEvents = ko.observableArray([
	//]);

	self.calendarPageMonthEvents = [];
	self.userPrivateEvents = [];
	self.publicEvents = [];

	//////////////////////////////////////////////////////////
	// METHODS 
	//////////////////////////////////////////////////////////

	self.getEventsForGivenMonth = function (events, month, year) {
		console.log(events);
		return ko.utils.arrayFilter(events, function (item) {
			console.log(item.startDate.month + ", " + month);
			return item.startDate.month == month && item.startDate.year == year;
		});
	};

	self.getEventsForGivenDay = function (events, day) {
		var intDay = parseInt(day);

		return ko.utils.arrayFilter(events, function(item) {
			return item.startDate.day === intDay;
		});
	};

	self.addEventOnClick = function () {
		var $addEventForm = $("#addEventForm");
		var action = $addEventForm.attr("action");

		$addEventForm.validate().form();
		$addEventForm.removeAttr("novalidate");

		if ($addEventForm.valid()) {
			var startHour = $("#startHourSelectBox").val();
			var endHour = $("#endHourSelectBox").val();
			var startMinute = $("#startMinuteSelectBox").val();
			var endMinute = $("#endMinuteSelectBox").val();

			var startEventDate = new Date();
			var endEventDate = new Date();

			var chosenDay = self.AddNewEvent_Day;
			var chosenMonth = self.calendarPageDisplayDate.month;
			var chosenYear = self.calendarPageDisplayDate.year;

			startEventDate.setMinutes(parseInt(startMinute));
			startEventDate.setHours(parseInt(startHour));
			startEventDate.setDate(chosenDay);
			startEventDate.setMonth(chosenMonth);
			startEventDate.setYear(chosenYear);

			endEventDate.setMinutes(parseInt(endMinute));
			endEventDate.setHours(parseInt(endHour));
			endEventDate.setDate(chosenDay);
			endEventDate.setMonth(chosenMonth);
			endEventDate.setYear(chosenYear);

			var diff = Math.abs(startEventDate - endEventDate);
			var minutes = Math.floor((diff / 1000) / 60);

			$.ajax({
				url: action,
				dataType: "JSON",
				type: "POST",
				data: $addEventForm.serialize() + "&Event.EventLengthInMinutes=" + minutes + "&Event.StartDate=" + startEventDate.toISOString(),
				success: function(result) {
					if (result.IsSuccess === false) {
						alert(result.Message);
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

	self.drawEventToCalendar = function(event) {
		console.log(event);
		$("#add-new-event-container").hide();

		var cellDay = ".day" + event.startDate.day;
		var $cellPlaceholder = $("#calendar").find(cellDay).find(".calendar-cell-placeholder");
		var cellLineStart = ".cell-line" + event.startDate.startHour;
		var cellLineEnd = ".cell-line" + event.startDate.endHour;

		var $cellLineStart = $cellPlaceholder.find(cellLineStart);
		var $cellLineEnd = $cellPlaceholder.find(cellLineEnd);

		var startOffset = parseFloat($cellLineStart[0].style.left);
		var endOffset = parseFloat($cellLineEnd[0].style.left);

		var width = endOffset - startOffset;
		var addressStr = typeof event.address == "undefined" ? event.address.street + ", " + event.address.city : "";

	var $event = $('<div class="event-rectangle" style="left:' + startOffset + '%; width:' + width + '%; border-color:' + event.kind.color + ' ">' + event.title + '<input type="hidden" name="' + event.title + '" adress="'+ addressStr +'" startHour="' + event.startDate.startHour + '" endHour="' + event.startDate.endHour + '" ></input></div>');

		$cellPlaceholder.append($event);

		$event.fadeTo("slow", .7);

		function placeEvent()
		{
			

		}
	};

	self.addEventToDetailsDay = function(event) {
		var $hourCell = $(".hour-cell-" + event.startDate.startHour);
		var startMinuteOffset = event.startDate.startMinute / 60 * 100;
		var endMinuteOffset = event.startDate.endMinute / 60 * 100;
		var width = ((event.startDate.endHour - event.startDate.startHour) * 100) - startMinuteOffset + endMinuteOffset;

		$hourCell.append('<div class="event-rectangle-details" style="width:' + width + '%;left:' + startMinuteOffset + '%;border-color:' + event.kind.color + ';"><span>' + event.title + '</span></div>');
	};

	self.removeEventRectanglesFromDetailsDay = function() {
		var $calendar = $("#calendarDayDetailsTable");
		$calendar.find(".event-rectangle-details").remove();
	};

	self.moveToDetailsPageOnCalendarCellClick = function (element) {
		self.removeEventRectanglesFromDetailsDay();

		var day = $(element).attr("dayNumber");

		console.log(self.userPrivateEvents);

		var monthEvents = self.getEventsForGivenMonth(self.userPrivateEvents, self.calendarPageDisplayDate.month, self.calendarPageDisplayDate.year);

		//console.log(monthEvents);

		var dayEvents = self.getEventsForGivenDay(monthEvents, day);

		for (var i in dayEvents) {
			self.addEventToDetailsDay(dayEvents[i]);
		}

		window.location = "#2";
	};

	self.showNextMonthOnNextMonthBtnClick = function() {
		var $calendar = $("#calendar");

		$calendar.empty();
		self.calendarPageDisplayDate.month++;

		if (self.calendarPageDisplayDate.month == 12) {
			self.calendarPageDisplayDate.year++;
			self.calendarPageDisplayDate.month = 0;
			$calendar.calendarWidget({ month: self.calendarPageDisplayDate.month, year: self.calendarPageDisplayDate.year });
		} else {
			$calendar.calendarWidget({ month: self.calendarPageDisplayDate.month, year: self.calendarPageDisplayDate.year });
		}

		ko.unapplyBindings($calendar, false);
		ko.applyBindings(self, $calendar[0]);

		var eventsInMonth = self.getEventsFromMonth(self.calendarPageDisplayDate.month, self.calendarPageDisplayDate.year);

		//draw to calendar
		ko.utils.arrayForEach(eventsInMonth, function(event) {
			if (event.startDate.month === self.calendarPageDisplayDate.month && event.startDate.year === self.calendarPageDisplayDate.year) {
				self.drawEventToCalendar(event);
			}
		});
	};

	self.showPreviousMonthOnPrevMonthBtnClick = function() {
		var $calendar = $("#calendar");
		$calendar.empty();

		self.calendarPageDisplayDate.month--;

		if (self.calendarPageDisplayDate.month == -1) {
			self.calendarPageDisplayDate.month = 11;
			self.calendarPageDisplayDate.year--;
			$calendar.calendarWidget({ month: self.calendarPageDisplayDate.month, year: self.calendarPageDisplayDate.year });
		} else {
			$calendar.calendarWidget({ month: self.calendarPageDisplayDate.month, year: self.calendarPageDisplayDate.year });
		}

		ko.unapplyBindings($calendar, false);
		ko.applyBindings(self, $calendar[0]);

		var eventsInMonth = self.getEventsFromMonth(self.calendarPageDisplayDate.month, self.calendarPageDisplayDate.year);

		//draw to calendar
		ko.utils.arrayForEach(eventsInMonth, function(event) {
			if (event.startDate.month === self.calendarPageDisplayDate.month && event.startDate.year === self.calendarPageDisplayDate.year) {
				self.drawEventToCalendar(event);
			}
		});

	};

	self.showRegisterFormOnClick = function() {
		var $loginForm = $("#loginPageContainer");
		var $registerForm = $("#registerPageContainer");

		$loginForm.hide();
		$registerForm.fadeIn();

	};

	self.showLoginFormOnClick = function() {
		var $loginForm = $("#loginPageContainer");
		var $registerForm = $("#registerPageContainer");

		$registerForm.hide();
		$loginForm.fadeIn();

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

	self.showAddEventPopupOnClick = function(element, data, e) {
		//var eventKind = $(element).parent().siblings(".menu-item").attr("name");

		$(element).hide();

		var $overlay = $("#calendar").siblings(".dotted-page-overlay");
		$overlay.css("opacity", 1);
		$overlay.show();

		var $addEventContainer = $("#add-new-event-container");

		var $eventStartDateTxtBox = $addEventContainer.find("#Event_StartDate");
		var dayNumber = $(element).siblings(".day").text();

		self.AddNewEvent_Day = dayNumber;

		var dateString = dayNumber + '/' + (self.calendarPageDisplayDate.month + 1) + '/' + self.calendarPageDisplayDate.year;
		$eventStartDateTxtBox.val(dateString);

		$addEventContainer.show();

		//document.querySelector('#add-new-event-container').scrollIntoView();

		e.stopPropagation();
	};

	self.redisplayCalendarAtChosenMonthOnClick = function (element) {

		var $calendar = $("#calendar");
		$calendar.empty();

		var $link = $(element);
		var $monthNameContainer = $link.parent();
		var $monthNameHeaderContainer = $monthNameContainer.parent();
		$monthNameHeaderContainer.find(".current-month-name-calendar").removeClass("current-month-name-calendar");
		$monthNameContainer.addClass("current-month-name-calendar");

		var month = $link.attr("name");
		self.calendarPageDisplayDate.month = month;

		$calendar.calendarWidget({ month: self.calendarPageDisplayDate.month, year: self.calendarPageDisplayDate.year });
		$calendar.append('<div class="calendar-navigation-arrows-left"><img src="Images/Nav/arrow-Left.png" alt="arrow-left"/></div>');
		$calendar.append('<div class="calendar-navigation-arrows-right"><img src="Images/Nav/arrow-Right.png" alt="arrow-Right"/></div>');

		ko.unapplyBindings($calendar, false);
		ko.applyBindings(self, $calendar[0]);

		$(".addNewEvent-cellIcon").click(function (event) {

			self.showAddEventPopupOnClick(this);
			event.stopPropagation();
		});

		self.calendarPageMonthEvents = self.getEventsForGivenMonth(self.userPrivateEvents, self.calendarPageDisplayDate.month, self.calendarPageDisplayDate.year);

		//draw to calendar
		ko.utils.arrayForEach(self.calendarPageMonthEvents, function(event) {		
			self.drawEventToCalendar(event);			
		});
	};

	self.showGivenFieldInAddNewEventPopupOnClick = function(element) {
		var $element = $(element);
		$element.next().show();
		$element.hide();
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
	var desc2 = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor in;";

	self.AddTestEvents = function() {
		self.publicEvents().push(new TestEvent({ startMinute: "", endMinute: "", startHour: 13, endHour: 14, day: 2, month: 1, year: 2014 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.publicEvents().push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 3, month: 1, year: 2014 }, "public", "Bania u Cygana", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Inne", color: "rgb(250, 84, 84)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 4, month: 1, year: 2014 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 16, endHour: 17, day: 2, month: 1, year: 2014 }, "public", "Szkolenie z .Net", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 2, month: 1, year: 2014 }, "public", "Szkolenie z Java", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Andrzej"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 5, month: 1, year: 2014 }, "public", "Spotkanie kola naukowego EniE", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 13, day: 2, month: 1, year: 2014 }, "public", "Kurs z pimpowania", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 7, month: 1, year: 2014 }, "public", "Ty tez mozesz zostac geekiem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 11, endHour: 15, day: 7, month: 1, year: 2014 }, "public", "Darmowe Browary do rozdania", "Warszwa, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2014 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 7, month: 1, year: 2014 }, "public", "Spotkanie organizacyjne", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Spotkanie", color: "rgb(253, 104, 170)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 15, month: 1, year: 2014 }, "public", "Majowka", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Sebuś"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 16, month: 1, year: 2014 }, "public", "Warsztaty twojego taty", "Wroclaw, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Alan"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 9, month: 1, year: 2014 }, "public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));

		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 13, endHour: 14, day: 5, month: 1, year: 2014 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 5, month: 1, year: 2014 }, "public", "Bania u Cygana", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Inne", color: "rgb(250, 84, 84)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 11, month: 1, year: 2014 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 16, endHour: 17, day: 11, month: 1, year: 2014 }, "public", "Szkolenie z .Net", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 11, month: 1, year: 2014 }, "public", "Szkolenie z Java", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Andrzej"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 12, month: 1, year: 2014 }, "public", "Spotkanie kola naukowego EniE", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 13, day: 12, month: 1, year: 2014 }, "public", "Kurs z pimpowania", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 14, month: 1, year: 2014 }, "public", "Ty tez mozesz zostac geekiem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 11, endHour: 15, day: 14, month: 1, year: 2014 }, "public", "Darmowe Browary do rozdania", "Warszwa, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2014 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 18, month: 1, year: 2014 }, "public", "Spotkanie organizacyjne", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Spotkanie", color: "rgb(253, 104, 170)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 21, month: 1, year: 2014 }, "public", "Majowka", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Sebuś"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 22, month: 1, year: 2014 }, "public", "Warsztaty twojego taty", "Wroclaw, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Alan"));
		self.publicEvents.push(new TestEvent({ startMinute: 30, endMinute: 48, startHour: 8, endHour: 17, day: 23, month: 1, year: 2014 }, "public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));

		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 13, endHour: 14, day: 9, month: 1, year: 2014 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 9, month: 1, year: 2014 }, "public", "Bania u Cygana", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Inne", color: "rgb(250, 84, 84)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 10, month: 1, year: 2014 }, "public", "Co Nowego?", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Aktualności", color: "rgb(68, 219, 93)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: 10, endMinute: 20, startHour: 12, endHour: 17, day: 6, month: 1, year: 2014 }, "public", "Szkolenie z .Net", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Zajęcia", color: "rgb(108, 255, 225)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 25, month: 1, year: 2014 }, "public", "Szkolenie z Java", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Andrzej"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 26, month: 1, year: 2014 }, "public", "Spotkanie kola naukowego EniE", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 13, day: 25, month: 1, year: 2014 }, "public", "Kurs z pimpowania", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 7, endHour: 10, day: 23, month: 1, year: 2014 }, "public", "Ty tez mozesz zostac geekiem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: 30, endMinute: 55, startHour: 11, endHour: 15, day: 27, month: 1, year: 2014 }, "public", "Darmowe Browary do rozdania", "Warszwa, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2014 }, { kindName: "Kurs", color: "rgb(54, 54, 54)" }, "Heniu"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 17, endHour: 21, day: 20, month: 1, year: 2014 }, "public", "Spotkanie organizacyjne", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Spotkanie", color: "rgb(253, 104, 170)" }, "Admin"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 20, month: 1, year: 2014 }, "public", "Majowka", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Sebuś"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 18, month: 1, year: 2014 }, "public", "Warsztaty twojego taty", "Wroclaw, Politechnika Wroclawska", desc2, { day: 2, month: 8, year: 2014 }, { kindName: "Szkolenie", color: "rgb(87, 167, 221)" }, "Alan"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 19, month: 1, year: 2014 }, "public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", desc, { day: 2, month: 8, year: 2014 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));
		self.publicEvents.push(new TestEvent({ startMinute: "", endMinute: "", startHour: 8, endHour: 17, day: 26, month: 1, year: 2014 }, "public", "Sniadanie z rektorem", "Wroclaw, Politechnika Wroclawska", desc, { day: 30, month: 3, year: 2014 }, { kindName: "Wydarzenie", color: "rgb(219, 219, 21)" }, "Anna"));
	};

	////////////////////////////////////////////////
	//var date = new Date();

	//day starts at 1, month starts at 0
	//self.calendarPageDisplayDate = { day: 1, month: 1, year: 2014 };
	//self.detailsPageDisplayDate = { day: 1, month: 1, year: 2014 };

	//self.AddTestEvents();

	var eventsInMonth = self.getEventsForGivenMonth(self.userPrivateEvents, self.calendarPageDisplayDate.month, self.calendarPageDisplayDate.year);

	//draw to calendar
	//ko.utils.arrayForEach(eventsInMonth, function (event) {
	//	if (event.startDate.month === self.calendarPageDisplayDate.month && event.startDate.year === self.calendarPageDisplayDate.year) {

	//		self.drawEventToCalendar(event);			
	//	}
	//});

	var eventsInToday = self.getEventsForGivenDay(eventsInMonth, self.calendarPageDisplayDate.day);

	for (var i in eventsInToday) {
		self.addEventToDetailsDay(eventsInToday[i]);

	}

}