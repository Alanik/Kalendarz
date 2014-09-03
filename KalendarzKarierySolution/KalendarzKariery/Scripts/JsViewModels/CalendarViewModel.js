﻿
function CalendarViewModel(year, month, day, weekday, userName) {

	var self = this;
	var colorHelper = new EventColorHelper();
	var date = new Date();

	self.monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
	self.dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
	self.userName = userName ? userName : '';

	//current event
	self.event = new KKEvent();
	self.eventKinds = [];
	self.eventPrivacyLevels = [];

	// from 0 to 11
	self.detailsPageDisplayDate = {
		"year": ko.observable(year),
		"month": ko.observable(month),
		"day": ko.observable(day),
		"weekday": ko.observable(weekday),
		"getMonthName": function () {
			return self.monthNames[this.month()];
		},
		"getDayName": function () {
			return self.dayNames[this.weekday()];
		}
	};

	self.detailsPageEventMostBottomRow = 1;

	self.calendarPageDisplayDate = {
		"year": ko.observable(year),
		"month": ko.observable(month)
	};

	self.addNewEvent_Day = ko.observable(0);

	self.calendarPageMonthEvents = [];
	self.detailsPageDayEvents = ko.observableArray([]);
	self.myEvents = [];

	self.eventTree = {
		// just an example to remember the format of eventTree object
		//	"2014": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//          },
		//	"2015": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//			}
	};

	//////////////////////////////////////////////////////////
	// METHODS 
	//////////////////////////////////////////////////////////

	self.getEventsForGivenMonth = function (month, year) {
		var daysProp, events = [];
		var yearProp = self.eventTree[year], monthProp, daysProp, events = [];
		if (yearProp) {
			monthProp = yearProp[month];
			if (monthProp) {
				for (var i in monthProp) {
					daysProp = monthProp[i];
					for (var j in daysProp) {
						events.push(daysProp[j]);
					}
				}
			}
		}

		return events;

		//return ko.utils.arrayFilter(events, function (item) {
		//	return item.startDate.month == month && item.startDate.year == year;
		//});
	};

	self.getEventsForGivenDay = function (day) {
		var yearProp = self.eventTree[self.detailsPageDisplayDate.year()], monthProp, daysProp, events = [];
		if (yearProp) {
			monthProp = yearProp[parseInt(self.detailsPageDisplayDate.month(), 10)];
			if (monthProp) {
				var daysProp = monthProp[self.detailsPageDisplayDate.day()];
				if (daysProp) {
					return daysProp;
				}
			}
		}

		return [];
	};

	self.addEventOnClick = function (privacyLvl) {

		var $loader;
		var $addEventForm = $("#addEventForm");
		var action = $addEventForm.attr("action");

		var day = $("#eventStartDayTxtBox").val();
		var month = $("#eventStartMonthTxtBox").val();
		var year = $("#eventStartYearTxtBox").val();

		day = parseInt(day, 10);
		month = parseInt(month, 10);
		year = parseInt(year, 10);

		if (!self.validateDate(day, month, year)) {
			$dateValidationMsg = $("#addNewEventContainer #dateValidationErrorMsg");
			$("#addNewEventContainer .event-startdate-txtbox").addClass("input-validation-error");
			$dateValidationMsg.removeClass("field-validation-valid").addClass("field-validation-error").show();
			return false;
		}

		self.addNewEvent_Day(day);
		self.calendarPageDisplayDate.month(month);
		self.calendarPageDisplayDate.year(year);

		$addEventForm.validate().form();
		//$addEventForm.removeAttr("novalidate");

		if ($addEventForm.valid()) {
			var startHour = $("#startHourSelectBox").val();
			var endHour = $("#endHourSelectBox").val();
			var startMinute = $("#startMinuteSelectBox").val();
			var endMinute = $("#endMinuteSelectBox").val();

			startHour = parseInt(startHour, 10);
			endHour = parseInt(endHour, 10);
			startMinute = parseInt(startMinute, 10);
			endMinute = parseInt(endMinute, 10);

			var dateDiffAtLeast10Mins = self.validateAddEventFormDates(startHour, endHour, startMinute, endMinute);
			if (!dateDiffAtLeast10Mins) {
				$("#endHourSelectBox").addClass("input-validation-error");
				$("#endMinuteSelectBox").addClass("input-validation-error");

				//TODO: validation message hard coded - needs to be moved to consts
				$("#endDateValidationErrorMsg").text("Wydarzenie powinno trwać przynajmniej 10 minut.").show();
				return false;
			}

			var startEventDate = new Date();
			var endEventDate = new Date();

			startEventDate.setMinutes(startMinute);
			startEventDate.setHours(startHour);
			startEventDate.setDate(day);
			startEventDate.setMonth(month - 1);
			startEventDate.setYear(year);

			endEventDate.setMinutes(endMinute);
			endEventDate.setHours(endHour);
			endEventDate.setDate(day);
			endEventDate.setMonth(month - 1);
			endEventDate.setYear(year);

			var diff = Math.abs(startEventDate - endEventDate);
			var minutes = Math.floor((diff / 1000) / 60);

			self.event.startDate = {
				startMinute: startMinute,
				endMinute: endMinute,
				startHour: startHour,
				endHour: endHour,
				day: day,
				month: month,
				year: year
			};

			self.event.eventLengthInMinutes = minutes;

			$loader = $addEventForm.closest(".main-section").siblings(".loader-container");

			$.ajax({
				url: action,
				dataType: "JSON",
				type: "POST",
				beforeSend: self.showLoader($loader),
				data: $addEventForm.serialize() +
				"&Event.EventLengthInMinutes=" + minutes +
				"&Event.StartDate=" + startEventDate.toISOString() +
				"&PrivacyLevel.Value=" + 1 +
				"&EventKind.Value=" + self.event.kind.value(),
				success: function (result) {
					if (result.IsSuccess === false) {
						self.hideLoader($loader, true);
						alert(result.Message);
					} else {

						//todo: color should be calculated automatically
						self.event.kind.color = colorHelper.calculatePrivateEventColor(self.event.kind.value());

						var eventToPush = new KKEvent();
						eventToPush.addedBy = self.userName;

						eventToPush.address.street = self.event.address.street;
						eventToPush.address.city = self.event.address.city;
						eventToPush.address.zipCode = self.event.address.zipCode;

						eventToPush.dateAdded.minute = self.event.dateAdded.minute;
						eventToPush.dateAdded.hour = self.event.dateAdded.hour;
						eventToPush.dateAdded.day = self.event.dateAdded.day;
						eventToPush.dateAdded.month = self.event.dateAdded.month;
						eventToPush.dateAdded.year = self.event.dateAdded.year;

						eventToPush.description = self.event.description;
						eventToPush.details = self.event.details;
						eventToPush.eventLengthInMinutes = self.event.eventLengthInMinutes;

						eventToPush.kind.value = self.event.kind.value();
						eventToPush.kind.name = self.event.kind.name();
						eventToPush.kind.color = self.event.kind.color;
						eventToPush.kind.headerColor = self.event.kind.headerColor;

						//TODO: return product id from server and set it here
						eventToPush.id = self.event.id;
						eventToPush.occupancyLimit = self.event.occupancyLimit;
						eventToPush.privacyLevel.name = self.event.privacyLevel.name;
						eventToPush.privacyLevel.value = self.event.privacyLevel.value;

						eventToPush.startDate.startMinute = self.event.startDate.startMinute;
						eventToPush.startDate.endMinute = self.event.startDate.endMinute;
						eventToPush.startDate.startHour = self.event.startDate.startHour;
						eventToPush.startDate.endHour = self.event.startDate.endHour;
						eventToPush.startDate.day = self.event.startDate.day;
						eventToPush.startDate.month = self.event.startDate.month;
						eventToPush.startDate.year = self.event.startDate.year;


						eventToPush.name = self.event.name;
						eventToPush.urlLink = self.event.urlLink;

						self.myEvents.push(eventToPush);

						var dayEvents = self.addEventToEventTree(eventToPush);

						var cellDay = ".day" + self.addNewEvent_Day();
						var $cellPlaceholder = $("#calendar").find(cellDay).find(".calendar-cell-placeholder");
						$cellPlaceholder.find(".event-rectangle").remove();

						for (var i in dayEvents) {
							self.drawEventToCalendar(dayEvents[i]);
						}

						$addEventForm[0].reset();
						$("#addNewEventContainer").hide();
						self.hideLoader($loader);
					}
				},
				error: function () {
					alert("Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz.");
					self.hideLoader($loader);
				}
			});
		}

		return false;
	};

	self.addEventToEventTree = function (newEvent) {
		var year = newEvent.startDate.year;
		var month = newEvent.startDate.month;
		var day = newEvent.startDate.day;

		var eventTreeYearProp = self.eventTree[year] ? self.eventTree[year] : self.eventTree[year] = {};
		var eventTreeMonthProp = eventTreeYearProp[month] ? eventTreeYearProp[month] : eventTreeYearProp[month] = {};
		var dayEvents = eventTreeMonthProp[day] ? eventTreeMonthProp[day] : eventTreeMonthProp[day] = [];

		dayEvents.push(newEvent);
		self.setCalendarPlacementRowAfterNewEventIsAdded(dayEvents);

		return dayEvents;
	}

	self.drawEventToCalendar = function (event) {

		var cellDay = ".day" + parseInt(event.startDate.day, 10);
		var $cellPlaceholder = $("#calendar").find(cellDay).find(".calendar-cell-placeholder");
		var cellLineStart = ".cell-line" + event.startDate.startHour;
		var cellLineEnd = ".cell-line" + event.startDate.endHour;

		var $cellLineStart = $cellPlaceholder.find(cellLineStart);

		var $cellLineEnd = $cellPlaceholder.find(cellLineEnd);

		var startOffset = parseFloat($cellLineStart[0].style.left);
		var endOffset = parseFloat($cellLineEnd[0].style.left);

		var width = endOffset - startOffset;
		var addressStreetStr = event.address.street !== "" ? event.address.street : "";
		var addressCityStr = event.address.city !== "" ? ", " + event.address.city : "";

		var addressStr = addressStreetStr + addressCityStr;

		var $event = $('<div class="event-rectangle" style="top:' + (event.calendarPlacementRow - 1) * 28 + 'px; left:' + startOffset + '%; width:' + width + '%; border-color:' + event.kind.color + ';">' + event.name + '<input type="hidden" name="' + event.name + '" address="' + addressStr + '" starthour="' + event.startDate.startHour + '" endhour="' + event.startDate.endHour + '" startminute="' + event.startDate.startMinute + '" endminute="' + event.startDate.endMinute + '" ></input></div>');

		$event.css("opacity", .8);

		$cellPlaceholder.append($event);
	};

	self.drawEventToDetailsDayTable = function (event) {
		//set detailsPageBottomRow to later calculate events container height dynamically
		if (event.calendarPlacementRow > self.displayPageEventMostBottomRow) {
			self.displayPageEventMostBottomRow = event.calendarPlacementRow;
		}

		var $hourCell = $(".hour-cell-" + event.startDate.startHour);
		var startMinuteOffset = event.startDate.startMinute / 60 * 100;
		var endMinuteOffset = event.startDate.endMinute / 60 * 100;
		var width = ((event.startDate.endHour - event.startDate.startHour) * 100) - startMinuteOffset + endMinuteOffset;

		$hourCell.append('<div class="event-rectangle-details" style="width:' + width + '%;top : ' + ((event.calendarPlacementRow - 1) * 46) + 'px;left:' + startMinuteOffset + '%;border-color:' + event.kind.color + ';"><span>' + event.name + '</span></div>');
	};

	self.removeEventRectanglesFromDetailsDay = function () {
		var $calendar = $("#calendarDayDetailsTable");
		$calendar.find(".event-rectangle-details").remove();
	};

	self.moveToDetailsPageOnCalendarCellClick = function (element) {
		self.displayPageEventMostBottomRow = 1;
		self.detailsPageDisplayDate.year(self.calendarPageDisplayDate.year());
		self.detailsPageDisplayDate.month(self.calendarPageDisplayDate.month());

		var day = $(element).attr("dayNumber");
		var dayInt = parseInt(day, 10);
		self.detailsPageDisplayDate.day(dayInt);

		var weekday = $(element).attr("weekday");
		self.detailsPageDisplayDate.weekday(weekday);

		self.removeEventRectanglesFromDetailsDay();

		var events = self.getEventsForGivenDay(dayInt)
		self.detailsPageDayEvents(events);

		for (var i in events) {
			self.drawEventToDetailsDayTable(events[i]);
		}

		var $tableBody = $("#calendarDayDetailsTable .table-details-body");
		var h = self.displayPageEventMostBottomRow * 46;
		$tableBody.height(h + "px");

		window.location = "#2";

	};

	self.showAddPrivateCalendarEventPopupOnClick = function (element, data, e) {

		self.event.privacyLevel.name = "Prywatne";
		self.event.privacyLevel.value = 1;
		$(element).hide();

		var $calendar = $("#calendar");

		var $overlay = $calendar.siblings(".dotted-page-overlay");
		$overlay.css("opacity", 1);
		$overlay.show();

		var $addEventContainer = $("#addNewEventContainer");
		$addEventContainer.detach().prependTo($calendar);

		var $eventTitle = $addEventContainer.find("#Event_Title");

		var dayNumber = $(element).siblings(".day").text();
		self.addNewEvent_Day(dayNumber);

		dayNumber = dayNumber < 10 ? '0' + dayNumber : dayNumber;
		var monthNumber = (self.calendarPageDisplayDate.month()) < 10 ? '0' + (self.calendarPageDisplayDate.month()) : self.calendarPageDisplayDate.month();

		$addEventContainer.find("#eventStartDayTxtBox").val(dayNumber);
		$addEventContainer.find("#eventStartMonthTxtBox").val(monthNumber);
		$addEventContainer.find("#eventStartYearTxtBox").val(self.calendarPageDisplayDate.year());

		$addEventContainer.show();
		$eventTitle.focus();

		if (e) {
			e.stopPropagation();
		}
	};

	self.closeAddNewEventPopupOnClick = function () {

		var $cont = $("#addNewEventContainer");
		var $section = $cont.closest(".main-section");
		var $overlay = $section.siblings(".dotted-page-overlay");
		$cont.find("#addEventForm")[0].reset();

		//TODO: overlay might be already hidden, so fadeOut might cause problems / performance issues
		$overlay.fadeOut();

		$("#addNewEventContainer").hide();

	};

	self.showRegisterFormOnClick = function () {
		var $loginForm = $("#loginPageContainer");
		var $registerForm = $("#registerPageContainer");
		var $overlay = $("#lobbyBg .dotted-page-overlay");

		$overlay.show();
		$loginForm.hide();
		$registerForm.fadeIn();

	};

	self.showLoginFormOnClick = function () {
		var $loginForm = $("#loginPageContainer");
		var $registerForm = $("#registerPageContainer");
		var $overlay = $("#lobbyBg .dotted-page-overlay");

		$overlay.show();
		$registerForm.hide();
		$loginForm.fadeIn();

		document.querySelector('#lobby-menu-header').scrollIntoView();
	};

	self.loginUserOnClick = function () {

		var $loginForm = $("#loginForm");
		var action = $loginForm.attr("action");

		$loginForm.validate().form();

		if ($loginForm.valid()) {
			$.ajax({
				url: action,
				type: "POST",
				data: $loginForm.serialize(),
				success: function (result) {

					if (result.validationError) {
						alert("Nazwa użytkownika lub hasło jest nieprawidłowe");
					} else {
						window.location = "/home";
					}
				},
				error: function () {
					alert("Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz.");
				}
			});
		}

		return false;
	};

	self.closeLoginPopupOnClick = function () {
		var $login = $("#loginPageContainer");
		var $overlay = $("#lobbyBg .dotted-page-overlay");

		$overlay.fadeOut();
		$login.hide();

	}

	self.closeRegisterPopupOnClick = function () {
		var $register = $("#registerPageContainer");
		var $overlay = $("#lobbyBg .dotted-page-overlay");

		$overlay.fadeOut();
		$register.hide();
	}

	self.registerUserOnClick = function () {
		var $dateBirthValidationMsg;
		var $registerForm = $("#registerForm");
		$registerForm.find(".summary-validation-errors").empty();
		var action = $registerForm.attr("action");

		var day = $("#birthDateDayTxtBox").val();
		var month = $("#birthDateMonthTxtBox").val();
		var year = $("#birthDateYearTxtBox").val();

		if (!self.validateDate(day, month, year)) {
			$dateBirthValidationMsg = $("#registerPageContainer #birthDateValidationErrorMsg");
			$("#registerPageContainer .register-birthdate-txtbox").addClass("input-validation-error");
			$dateBirthValidationMsg.show();
			return false;
		}

		$registerForm.validate().form();

		if ($registerForm.valid()) {
			$.ajax({
				url: action,
				type: "POST",
				data: $registerForm.serialize(),
				success: function (result) {
					if (result.isRegisterSuccess === false) {
						displayErrors(result.errors);
					} else {
						window.location = "/home";
					}
				},
				error: function () {
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

				if (error.Value && error.Value.length > 0) {
					$registerForm.find(".summary-validation-errors").append("<div>" + error.Value[0] + "</div>");
				}

				if (error.Key !== "") {
					label = $registerForm.find("input[name = '" + error.Key + "']").removeClass("valid").addClass("input-validation-error").next().removeClass("field-validation-valid").addClass("field-validation-error");
					label.html(error.Value[0]);
				}
			}
		}

	};

	self.validateDate = function (day, month, year) {

		if (day == "" || month == "" || year == "") {
			return true;
		}

		var birthDate = day + "/" + month + "/" + year;
		return isDate(birthDate);

		//Validates a date input -- http://jquerybyexample.blogspot.com/2011/12/validate-date-    using-jquery.html
		function isDate(txtDate) {

			var currVal = txtDate;
			if (currVal == '')
				return false;

			//Declare Regex  
			var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
			var dtArray = currVal.match(rxDatePattern); // is format OK?

			if (dtArray == null)
				return false;

			//Checks for dd/mm/yyyy format.
			var dtDay = dtArray[1];
			var dtMonth = dtArray[3];
			var dtYear = dtArray[5];

			if (dtMonth < 1 || dtMonth > 12)
				return false;
			else if (dtDay < 1 || dtDay > 31)
				return false;
			else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31)
				return false;
			else if (dtMonth == 2) {
				var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
				if (dtDay > 29 || (dtDay == 29 && !isleap))
					return false;
			}

			return true;
		}
	}

	self.validateAddEventFormDates = function (startH, endH, startM, endM) {

		var startDate = new Date(2014, 1, 1, startH, startM, 0, 0);
		var endDate = new Date(2014, 1, 1, endH, endM, 0, 0);

		var timeDiff = endDate.getTime() - startDate.getTime();

		if (timeDiff < 0) {
			return false;
		}

		var diffMinutes = Math.ceil(timeDiff / ((1000 * 3600) / 60));

		if (diffMinutes < 10) {
			return false;
		}

		return true;
	}

	self.showAddPublicEventPopupOnClick = function (element, data, e) {

		self.event.privacyLevel.name("publiczne");

		var $overlay = $("#lobby").siblings(".dotted-page-overlay");
		$overlay.css("opacity", 1);
		$overlay.show();

		var $addEventContainer = $("#addNewEventContainer");

		$addEventContainer.detach().prependTo("#lobby");

		$addEventContainer.show();
	};

	self.showAddPrivateEventLobbyPopupOnClick = function (element, data, e) {
		self.event.privacyLevel.name = "Prywatne";
		self.event.privacyLevel.value = 1;

		var $lobby = $("#lobby");

		var $overlay = $lobby.siblings(".dotted-page-overlay");
		$overlay.css("opacity", 1);
		$overlay.show();

		var $addEventContainer = $("#addNewEventContainer");
		$addEventContainer.detach().prependTo($lobby);

		$addEventContainer.find("#Event_StartDate").prop("disabled", false);
		$addEventContainer.show();
		$addEventContainer.find("#Event_Title").focus();
	};

	self.redisplayCalendarAtChosenMonthOnClick = function (element) {
		var $calendar = $("#calendar");
		var $addNewEvent = $("#addNewEventContainer");
		var $loader = $calendar.siblings(".loader-container");

		self.showLoader($loader, true);

		$addNewEvent.detach();

		var $link = $(element);
		var $monthNameContainer = $link.parent();
		var $monthNameHeaderContainer = $monthNameContainer.parent();
		$monthNameHeaderContainer.find(".current-month-name-calendar").removeClass("current-month-name-calendar");
		$monthNameContainer.addClass("current-month-name-calendar");

		var month = parseInt($link.attr("name"), 10);

		$calendar.calendarWidget({ month: month - 1, year: self.calendarPageDisplayDate.year() });
		ko.unapplyBindings($calendar);
		ko.applyBindings(self, $calendar[0]);

		$calendar.append('<div class="calendar-navigation-arrows-left"><img src="Images/Nav/arrow-Left.png" alt="arrow-left"/></div>');
		$calendar.append('<div class="calendar-navigation-arrows-right"><img src="Images/Nav/arrow-Right.png" alt="arrow-Right"/></div>');
		$addNewEvent.prependTo($calendar);

		self.calendarPageDisplayDate.month(month);
		self.calendarPageMonthEvents = self.getEventsForGivenMonth(self.calendarPageDisplayDate.month(), self.calendarPageDisplayDate.year());

		//draw to calendar
		ko.utils.arrayForEach(self.calendarPageMonthEvents, function (event) {
			self.drawEventToCalendar(event);
		});

		self.hideLoader($loader, true);
	};

	self.showGivenFieldInAddNewEventPopupOnClick = function (element) {
		var $element = $(element);
		$element.next().show();
		$element.hide();
	};

	self.setCalendarPlacementRowAfterNewEventIsAdded = function (dayEvents) {
		var anotherEvent;
		var eStartH, eEndH, eStartM, eEndM;
		var eventsInTheSameDayTemp = [];
		var event;

		for (var i in dayEvents) {

			event = dayEvents[i];
			eStartH = event.startDate.startHour;
			eEndH = event.startDate.endHour;
			eStartM = event.startDate.startMinute;
			eEndM = event.startDate.endMinute

			for (var j = 0; j < eventsInTheSameDayTemp.length; j++) {
				anotherEvent = eventsInTheSameDayTemp[j];

				var aeStartH = anotherEvent.startDate.startHour;
				var aeEndH = anotherEvent.startDate.endHour;
				var aeStartM = anotherEvent.startDate.starMinute;
				var aeEndM = anotherEvent.startDate.endMinute

				//eventStartTime < anotherEventEndTime || eventEndTime > anotherEventStartTime
				if ((eStartH < aeEndH || (eStartH == aeEndH && eStartM < aeEndM)) || (eEndH < aeStartH || eEndH == aeStartH && eEndM < aeStartM)) {
					//there is conflict

					if (event.calendarPlacementRow == anotherEvent.calendarPlacementRow) {
						event.calendarPlacementRow++;
					}
				}
			}

			eventsInTheSameDayTemp.push(event);

			//TODO: current sorting not optimal, correct way is to insert value at the correct index
			eventsInTheSameDayTemp.sort(function (a, b) {
				return parseInt(a.calendarPlacementRow, 10) - parseInt(b.calendarPlacementRow, 10)
			});

		}
	};

	self.showLoader = function ($loaderContainer, dontShowOverlay) {
		if (!dontShowOverlay) {
			var $overlay = $loaderContainer.siblings(".dotted-page-overlay");

			if ($overlay.css("display") == "none") {
				$overlay.show();
			}
		}

		$loaderContainer.show();
	};

	self.hideLoader = function ($loaderContainer, keepOverlayVisible) {

		if (!keepOverlayVisible) {
			$loaderContainer.siblings(".dotted-page-overlay").fadeOut();
		}

		$loaderContainer.hide();

	};

	//////////////////////////////////////////////////////
	// KO extention/helper methods
	//////////////////////////////////////////////////////

	ko.unapplyBindings = function ($node) {
		// unbind events
		//$node.find("*").each(function () {
		//	$(this).unbind();
		//});

		// Remove KO subscriptions and references
		ko.cleanNode($node[0]);
	};

}