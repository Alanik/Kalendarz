
function CalendarViewModel(year, month, day, weekday) {
	var self = this;
	var colorHelper = new EventColorHelper();
	var date = new Date();

	self.monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
	self.dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

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

	// from 0 to 11
	self.calendarPageDisplayDate = {
		"year": year,
		"month": month
	};

	self.AddNewEvent_Day = 0;

	self.calendarPageMonthEvents = [];
	self.detailsPageDayEvents = ko.observableArray([]);
	self.myEvents = [];

	self.eventTree = {
		// just an example to remember the format of eventTree object
		//	"2014": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]			
		//}
	};

	//////////////////////////////////////////////////////////
	// METHODS 
	//////////////////////////////////////////////////////////

	self.getEventsForGivenMonth = function (month, year) {
		var daysProp, events = [];
		var yearProp = self.eventTree[year], monthProp, daysProp, events = [];
		if (yearProp) {
			monthProp = yearProp[month + 1];
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
			monthProp = yearProp[parseInt(self.detailsPageDisplayDate.month(), 10) + 1];
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

		$addEventForm.validate().form();
		$addEventForm.removeAttr("novalidate");

		if ($addEventForm.valid()) {

			var startHour = $("#startHourSelectBox").val();
			var endHour = $("#endHourSelectBox").val();
			var startMinute = $("#startMinuteSelectBox").val();
			var endMinute = $("#endMinuteSelectBox").val();

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

			self.event.startDate = {
				startMinute: startMinute,
				endMinute: endMinute,
				startHour: startHour,
				endHour: endHour,
				day: chosenDay,
				month: chosenMonth,
				year: chosenYear
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
						self.myEvents.push(self.event);
						self.event.kind.color = colorHelper.calculatePrivateEventColor(self.event.kind.value());
						self.drawEventToCalendar(self.event);
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

	self.drawEventToCalendar = function (event) {

		self.event.kind.name(event.kind.name);
		self.event.kind.value(event.kind.value);

		var cellDay = ".day" + event.startDate.day;
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
		self.detailsPageDisplayDate.year(self.calendarPageDisplayDate.year);
		self.detailsPageDisplayDate.month(self.calendarPageDisplayDate.month);

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

		var $eventStartDateTxtBox = $addEventContainer.find("#Event_StartDate");
		var dayNumber = $(element).siblings(".day").text();
		self.AddNewEvent_Day = dayNumber;

		var dateString = dayNumber + '/' + (self.calendarPageDisplayDate.month + 1) + '/' + self.calendarPageDisplayDate.year;
		$eventStartDateTxtBox.val(dateString).prop("disabled", true);

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

		$registerForm.validate().form();

		if (!validateBirthDate()) {
			$dateBirthValidationMsg = $("#registerPageContainer #birthDateValidationErrorMsg");
			$dateBirthValidationMsg.show();
			$("#registerPageContainer .register-birthdate-txtbox").addClass("input-validation-error");

			return false;
		}

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

		function validateBirthDate() {
			var day = $("#birthDateDayTxtBox").val();
			var month = $("#birthDateMonthTxtBox").val();
			var year = $("#birthDateYearTxtBox").val();

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

		//var $eventStartDateTxtBox = $addEventContainer.find("#Event_StartDate");
		//var dayNumber = $(element).siblings(".day").text();

		//self.AddNewEvent_Day = dayNumber;

		// dateString = dayNumber + '/' + (self.calendarPageDisplayDate.month + 1) + '/' + self.calendarPageDisplayDate.year;
		//$eventStartDateTxtBox.val(dateString);

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
		$addNewEvent.detach();

		var $link = $(element);
		var $monthNameContainer = $link.parent();
		var $monthNameHeaderContainer = $monthNameContainer.parent();
		$monthNameHeaderContainer.find(".current-month-name-calendar").removeClass("current-month-name-calendar");
		$monthNameContainer.addClass("current-month-name-calendar");

		var month = parseInt($link.attr("name"));

		$calendar.calendarWidget({ month: month, year: self.calendarPageDisplayDate.year });
		ko.unapplyBindings($calendar);
		ko.applyBindings(self, $calendar[0]);

		$calendar.append('<div class="calendar-navigation-arrows-left"><img src="Images/Nav/arrow-Left.png" alt="arrow-left"/></div>');
		$calendar.append('<div class="calendar-navigation-arrows-right"><img src="Images/Nav/arrow-Right.png" alt="arrow-Right"/></div>');
		$addNewEvent.prependTo($calendar);

		self.calendarPageDisplayDate.month = parseInt(month);
		self.calendarPageMonthEvents = self.getEventsForGivenMonth(self.calendarPageDisplayDate.month, self.calendarPageDisplayDate.year);

		//draw to calendar
		ko.utils.arrayForEach(self.calendarPageMonthEvents, function (event) {
			self.drawEventToCalendar(event);
		});
	};

	self.showGivenFieldInAddNewEventPopupOnClick = function (element) {
		var $element = $(element);
		$element.next().show();
		$element.hide();
	};

	self.showLoader = function ($loaderContainer) {
		var $overlay = $loaderContainer.siblings(".dotted-page-overlay");

		if ($overlay.css("display") == "none") {
			$overlay.show();
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