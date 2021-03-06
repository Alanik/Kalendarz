﻿function AppViewModel(userName, spinner) {
	"use strict";

	var self = this;
	var date = new Date();
	//////////////////////////////////////////////////////////
	//utils, managers etc
	//////////////////////////////////////////////////////////
	self.UTILS = (function (spinner) {
		var Utils = function (spinner) {
			this.colorHelper = new EventColorHelper();
			this.webApiCaller = new WebApiCaller();
			this.eventTreeBuilder = new TreeBuilder(self);
			this.loader = (function (spinner) {
				var $spinner = $("#appSpinnerContainer");
				var $overlay = $("#appContainer").children(".app-page-overlay");

				return {
					$overlay: $overlay,
					spinner: spinner,
					show: function (shouldDisplayOverlay) {
						if (shouldDisplayOverlay) {
							$overlay.show();
						}

						//Get the window height and width
						var winH = $(window).height();
						var winW = $(window).width();

						//Set the popup window to center
						$spinner.css('top', winH / 2 - $spinner.height() / 2);
						$spinner.css('left', winW / 2 - $spinner.width() / 2);

						this.spinner.spin($spinner[0]);
						$spinner.show();
					},
					hide: function (shouldHideOverlay) {
						if (shouldHideOverlay) {
							$overlay.hide();
						}

						this.spinner.stop();
						$spinner.hide();
					}
				}
			}(spinner));
			this.notificationUtil = new NotificationUtil($("#appContainer"));
		}
		return new Utils(spinner);
	})(spinner);
	self.EVENT_MANAGER = new EventManager(self);
	self.NOTE_MANAGER = new NoteManager(self);

	//////////////////////////////////////////////////////////
	//public properties
	//////////////////////////////////////////////////////////
	var year = date.getFullYear(), month = date.getMonth(), day = date.getDate();

	//0 - lobby page
	//1 - calendar page
	//2 - details page
	self.currentPage = function () {
		return Number(window.location.hash.substring(1));
	};

	self.todayDate = {
		"javaScriptDate": date,
		"day": day,
		//month starts from 1 to 12
		"month": month + 1,
		"year": year,
		"getMonthName": function () {
			return self.monthNames[(this.month - 1)];
		},
		"getDayName": function () {
			var weekday = new Date().getDay();
			return weekday == 0 ? self.dayNames[6] : self.dayNames[weekday - 1];
		}
	}

	self.monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
	self.monthObjs = [{ name: 'Styczeń', value: 1 }, { name: 'Luty', value: 2 }, { name: 'Marzec', value: 3 }, { name: 'Kwiecień', value: 4 }, { name: 'Maj', value: 5 }, { name: 'Czerwiec', value: 6 }, { name: 'Lipiec', value: 7 }, { name: 'Sierpień', value: 8 }, { name: 'Wrzesień', value: 9 }, { name: 'Październik', value: 10 }, { name: 'Listopad', value: 11 }, { name: 'Grudzień', value: 12 }];
	self.dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
	self.userName = userName;

	self.eventKinds = [];
	self.eventPrivacyLevels = {};

	self.skinThemes = ["default-gray", "default-light", "default-dark"];
	self.currentSkinThemeIndex = 0;

	// is used when adding or editing event
	self.observableEvent = new KKEventModelObservable();

	self.publicEventTree = {
		// example
		//	"2014": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//          },
		//	"2015": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//			}
	};

	self.myEventTreeCountBasedOnEventKind = null;
	// examplec self.myEventTreeCountBasedOnEventKind
	//
	//"1": {
	//	"upcoming": ko.observable(10),
	//	"old" : ko.observable(20)
	//},
	//"2": {
	//	"upcoming": ko.observable(10),
	//	"old" : ko.observable(20)
	//}

	self.myEventTree = {
		// example to remember the format of myEventTree object
		//	"2014": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//          },
		//	"2015": {
		//		"8": [{ "3": [event, event] }, { "7": [event] }, { "9": [event, event, event, event] }],
		//		"9": [{ "2": [event] }]	
		//			}
	};

	self.myNoteTree = {
		// example to remember the format of dailyNotesTree object
		//	"2014": {
		//		"8": [{ "3": [note, note] }, { "7": [note] }, { "9": [note, note, note, note] }],
		//		"9": [{ "2": [note] }]	
		//          },
		//	"2015": {
		//		"8": [{ "3": [note, note] }, { "7": [note] }, { "9": [note, note, note, note] }],
		//		"9": [{ "2": [note] }]	
		//			}
	};

	//////////////////////////////////////////////////////////
	//page view models
	//////////////////////////////////////////////////////////

	self.lobbyPage = {};
	self.calendarPage = {};
	self.detailsPage = {};

	self.lobbyPage.navPart = {};
	self.lobbyPage.dashboardPart = {};
	self.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM = ko.observableArray([]);
	self.lobbyPage.dashboardPart.upcomingPublicEventsVM = ko.observableArray([]);
	self.lobbyPage.dashboardPart.myCalendarVM = {
		"today": ko.observableArray([]),
		"tommorow": ko.observableArray([]),
		"dayAfterTommorow": ko.observableArray([])
	}
	self.lobbyPage.upcomingEventsPart = {};
	// example
	//
	//"1": {
	//	"upcoming": ko.observable(10),
	//	"old" : ko.observable(20)
	//},
	//"2": {
	//	"upcoming": ko.observable(10),
	//	"old" : ko.observable(20)
	//}
	self.lobbyPage.upcomingEventsPart.publicEventTreeCountBasedOnEventKindVM = null;
	self.lobbyPage.upcomingEventsPart.eventListVM = {
		"menuItems": {
			"publicEvents": {
				"index": 1,
				//TODO: maybe change into event tree with arrays grouped by event kind
				"selectedEvents": {
					//it is filled with public events when building publicEventTree
					"old": ko.observableArray([]),
					"upcoming": ko.observableArray([])
				},
				"showOld": ko.observable(false),
				"showUpcoming": ko.observable(true)
			}
		},
		"selectedMenuItem": ko.observable(1),
		"selectedEventKindValues": [],
		"getSelectedEvents": function () {
			switch (this.selectedMenuItem()) {
				case 1:
					return this.menuItems.publicEvents.selectedEvents;
				default:
					return [];
			}
		},
		"isOpen": ko.observable(false)
	}
	self.lobbyPage.eventGridPart = {};
	//it is filled with public events when building publicEventTree
	self.lobbyPage.eventGridPart.publicEventsVM = ko.observableArray([]);

	self.calendarPage.calendarPart = {};
	self.calendarPage.calendarPart.calendarVM = {
		"displayDate": {
			year: ko.observable(year),
			//month starts from 1 to 12
			month: ko.observable(month + 1),
			monthName: ko.observable("")
		},
		"monthEvents": []
	};
	self.calendarPage.calendarPart.calendarVM.displayDate.monthName(self.monthNames[self.calendarPage.calendarPart.calendarVM.displayDate.month() - 1]);
	self.calendarPage.calendarPart.calendarVM.displayDate.month.subscribe(function (month) {
		self.calendarPage.calendarPart.calendarVM.displayDate.monthName(self.monthNames[month - 1]);
		self.redisplayCalendarAtChosenMonth(self.calendarPage.calendarPart.calendarVM.displayDate.month());
	});

	self.detailsPage.journalPart = {};
	self.detailsPage.journalPart.eventListVM = {
		"menuItems": {
			"myCalendar": {
				"index": 1,
				//TODO: maybe change into event tree with arrays grouped by event kind
				"selectedEvents": {
					"old": ko.observableArray([]),
					"upcoming": ko.observableArray([])
				},
				"showOld": ko.observable(false),
				"showUpcoming": ko.observable(true)
			},
			"manageOwnPublicEvents": {
				"index": 2,
				//TODO: maybe change into event tree with arrays grouped by event kind
				"selectedEvents": {
					// TODO: oldTemp and upcomingTemp are filled when building publicEventTree and then those arrays are put into old/upcoming observale array on showSelectedJournalMenuItem
					// is made this way because otherwise app will throw errors... fix it when you get a chance (remove oldTemp and upcomingTemp)
					"oldTemp": [],
					"upcomingTemp": [],

					"old": ko.observableArray([]),
					"upcoming": ko.observableArray([])
				},
				"showOld": ko.observable(false),
				"showUpcoming": ko.observable(true)
			}
		},
		"selectedMenuItem": ko.observable(1),
		"getSelectedEvents": function () {
			switch (this.selectedMenuItem()) {
				case 1:
					return this.menuItems.myCalendar.selectedEvents;
				case 2:
					return this.menuItems.manageOwnPublicEvents.selectedEvents;
				default:
					return [];
			}
		},
		"selectedEventKindValues": [],
		"isOpen": ko.observable(false)
	}

	self.detailsPage.dayPlanPart = {};
	self.detailsPage.dayPlanPart.dayPlanTableVM = {
		"date": {
			"year": ko.observable(year),
			//month starts from 1 to 12
			"month": ko.observable(month + 1),
			"day": ko.observable(day),
			"getMonthName": function () {
				return self.monthNames[this.month() - 1];
			},
			"getDayName": function () {
				var weekday = new Date(this.year(), this.month() - 1, this.day()).getDay();
				return weekday == 0 ? self.dayNames[6] : self.dayNames[weekday - 1];
			}
		},
		// used to specify the most bottom row of events in details page in the daily plan table
		"eventMostBottomRow": 1
	}
	self.detailsPage.dayPlanPart.eventListVM = {
		"events": ko.observableArray([])
	}
	self.detailsPage.dayPlanPart.noteListVM = {
		"notes": ko.observableArray([]),
		"observableNote": new KKNoteModelObservable(),
		"isAddNoteSectionOpen": ko.observable(false)
	}

	//////////////////////////////////////////////////////////
	// METHODS 
	//////////////////////////////////////////////////////////

	self.saveEventOnClick = function (isUpdate) {
		var dataToSend, webApi, $addEventContainer, promise, notification;
		var day = parseInt(self.observableEvent.startDate.day(), 10);
		var month = parseInt(self.observableEvent.startDate.month(), 10);
		var year = parseInt(self.observableEvent.startDate.year(), 10);

		if (isFormInvalid(day, month, year)) return;

		notification = self.UTILS.notificationUtil.newNotification();
		notification.loading("zapisywanie wydarzenia...");
		self.UTILS.loader.$overlay.hide();
		$addEventContainer = $("#addNewEventContainer");
		$addEventContainer.hide();

		webApi = self.UTILS.webApiCaller;

		dataToSend = prepareData(day, month, year);

		//////////////////////////////////////////////
		//call WebAPI - Add new event
		//////////////////////////////////////////////
		promise = isUpdate ? webApi.callUpdateEvent(dataToSend) : webApi.callAddEvent(dataToSend);
		promise.then(successCallback, failureCallback);

		function successCallback(data, textStatus, request) {
			webApi.interceptResponse(data, request, function (webApiOutput) {
				success(data, webApiOutput);
			});
		};
		function failureCallback(data, textStatus, request) {
			webApi.interceptResponse(data, request, function () {
				notification.error("Wystąpił błąd. Zapisanie wydarzenia się niepowiodło.");
				error(data);
			})
		};
		function success(result, webApiOutput) {
			var kkEvent, date = new Date();
			var status = { name: "Accepted", value: 1 };
			var isCurrentUserSignedUpForEvent = false,
				isEventAddedToCurrentUserCalendar = true;

			if (result.IsSuccess === false) {
				$addEventContainer.show();
				self.UTILS.loader.$overlay.show();
				notification.error(result.Message);
				return;
			}

			notification.success("Wydarzenie zostało dodane.", webApiOutput);

			var startHour = parseInt(self.observableEvent.startDate.startHour(), 10);
			var endHour = parseInt(self.observableEvent.startDate.endHour(), 10);
			var startMinute = parseInt(self.observableEvent.startDate.startMinute(), 10);
			var endMinute = parseInt(self.observableEvent.startDate.endMinute(), 10);
			var startEventDate, endEventDate, diff, minutes;
			startEventDate = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
			endEventDate = new Date(year, month - 1, day, endHour, endMinute, 0, 0);

			//TODO: move this code to separate class and unit test it
			////////////
			diff = Math.abs(startEventDate - endEventDate);
			minutes = Math.floor((diff / 1000) / 60);
			////////////

			kkEvent = self.EVENT_MANAGER.getNewKKEventModel(
				self.userName,
				self.observableEvent.address.street(),
				self.observableEvent.address.city(),
				self.observableEvent.address.zipCode(),
				self.observableEvent.description(),
				self.observableEvent.details(),
				minutes,
				self.observableEvent.kind.value(),
				self.observableEvent.kind.name(),
				result.EventId,
				self.observableEvent.occupancyLimit(),
				self.observableEvent.privacyLevel.name,
				self.observableEvent.privacyLevel.value,
				new KKEventDateModel(startMinute, endMinute, startHour, endHour, day, month, year),
				self.observableEvent.name(),
				self.observableEvent.urlLink(),
				self.observableEvent.price(),
				new KKDateModel(date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getFullYear()),
				isEventAddedToCurrentUserCalendar,
				isCurrentUserSignedUpForEvent,
				//TODO: refactor event status code
				status
			);

			var dayEvents = self.EVENT_MANAGER.addEvent(kkEvent);

			self.setCalendarPlacementRow(dayEvents);
			self.redrawCalendarCell(dayEvents, kkEvent.startDate.year, kkEvent.startDate.month, kkEvent.startDate.day);
		}
		function error(result) {
			alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
			$addEventContainer.show();
			self.UTILS.loader.$overlay.show();
		};
		function isFormInvalid(day, month, year) {
			var startHour, endHour, startMinute, endMinute, dateDiffAtLeast10Mins, $addEventForm, $addEventContainer, $dateValidationMsg;

			if (!self.validateDate(day, month, year)) {
				$dateValidationMsg = $("#addNewEventContainer #dateValidationErrorMsg");
				$("#addNewEventContainer .event-startdate-txtbox").addClass("input-validation-error");
				$dateValidationMsg.removeClass("field-validation-valid").addClass("field-validation-error").show();
				return true;
			}

			$addEventForm = $("#addEventForm");
			$addEventForm.validate().form();

			if ($addEventForm.valid() === false) return true;

			startHour = parseInt(self.observableEvent.startDate.startHour(), 10);
			endHour = parseInt(self.observableEvent.startDate.endHour(), 10);
			startMinute = parseInt(self.observableEvent.startDate.startMinute(), 10);
			endMinute = parseInt(self.observableEvent.startDate.endMinute(), 10);

			dateDiffAtLeast10Mins = self.validateAddEventFormDates(startHour, endHour, startMinute, endMinute);
			if (!dateDiffAtLeast10Mins) {
				$("#endHourSelectBox").addClass("input-validation-error");
				$("#endMinuteSelectBox").addClass("input-validation-error");
				$("#endDateValidationErrorMsg").text("Wydarzenie powinno trwać przynajmniej 10 minut.").show();

				return true;
			}
		};
		function prepareData(day, month, year) {
			var notification, privacyLvlValue, eventKindValue, startEventDate, endEventDate, diff, minutes, startDateJson, data;

			var startHour = parseInt(self.observableEvent.startDate.startHour(), 10);
			var endHour = parseInt(self.observableEvent.startDate.endHour(), 10);
			var startMinute = parseInt(self.observableEvent.startDate.startMinute(), 10);
			var endMinute = parseInt(self.observableEvent.startDate.endMinute(), 10);

			privacyLvlValue = self.observableEvent.privacyLevel.value;
			eventKindValue = self.observableEvent.kind.value();
			startEventDate = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
			endEventDate = new Date(year, month - 1, day, endHour, endMinute, 0, 0);

			//TODO: move this code to separate class and unit test it
			////////////
			diff = Math.abs(startEventDate - endEventDate);
			minutes = Math.floor((diff / 1000) / 60);
			////////////

			startDateJson = startEventDate.toJSON();

			///////////////////////////////////////////
			//prepare parameters to call WebAPI
			///////////////////////////////////////////
			data = $("#addEventForm").serialize() +
				"&Event.StartDate=" + startDateJson +
				"&EventStartDate.Year=" + year +
				"&EventStartDate.Month=" + month +
				"&EventStartDate.Day=" + day +
				"&EventStartDate.Hour=" + startHour +
				"&EventStartDate.Minute=" + startMinute +
				"&EventEndDate.Year=" + year +
				"&EventEndDate.Month=" + month +
				"&EventEndDate.Day=" + day +
				"&EventEndDate.Hour=" + endHour +
				"&EventEndDate.Minute=" + endMinute +
				"&PrivacyLevel.Value=" + privacyLvlValue +
				"&EventKind.Value=" + eventKindValue;

			return data
		};
	};
	self.AddNoteOnClick = function () {
		var data, text = self.detailsPage.dayPlanPart.noteListVM.observableNote.data().trim(), webApi = self.UTILS.webApiCaller;

		if (text == "") {
			return false;
		}

		data = 'Data=' + text;
		data += '&DisplayDate.Year=' + self.detailsPage.dayPlanPart.dayPlanTableVM.date.year();
		data += '&DisplayDate.Month=' + self.detailsPage.dayPlanPart.dayPlanTableVM.date.month();
		data += '&DisplayDate.day=' + self.detailsPage.dayPlanPart.dayPlanTableVM.date.day();

		//////////////////////////////////////////////
		//call WebAPI - Add new note
		//////////////////////////////////////////////
		self.UTILS.loader.show(true);

		webApi.callAddNote(data).then(
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { success(data) }); },
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { error(data) }); })

		function success(result) {
			var displayDate, kkNote, date = new Date();

			if (result.IsSuccess === false) {
				self.UTILS.loader.hide(true);
				alert(result.Message);
			} else {
				displayDate = new KKDateModel(null, null, self.detailsPage.dayPlanPart.dayPlanTableVM.date.day(), self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(), self.detailsPage.dayPlanPart.dayPlanTableVM.date.year());

				kkNote = self.NOTE_MANAGER.getNewKKNoteModel(result.NoteId, self.detailsPage.dayPlanPart.noteListVM.observableNote.data(), self.userName, self.detailsPage.dayPlanPart.noteListVM.observableNote.privacyLevel.name,
					self.detailsPage.dayPlanPart.noteListVM.observableNote.privacyLevel.value, displayDate, false, new KKDateModel(date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getFullYear()));
				self.NOTE_MANAGER.addNote(kkNote);

				self.detailsPage.dayPlanPart.noteListVM.observableNote.data("");
				self.UTILS.loader.hide(true);
			}
		}
		function error() {
			alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
			self.UTILS.loader.hide(true);
		}
	};

	self.prepareDeleteEventDetailsPageOnDeleteLinkClick = function (id, year, month, day, privacyLevelName) {
		var $popup = $("#appContainer").children(".confirmation-popupbox");

		var selectedKKEventModel = self.EVENT_MANAGER.getEventByDateAndId(id, year, month, day, self.myEventTree);

		var $yesBtn = $popup.find(".confirmation-popupbox-yesbtn");
		$yesBtn.attr("data-bind", "click: function () { $root.deleteEventDetailsPageOnConfirmationYesBtnClick($element, " + id + "," + year + "," + month + "," + day + ")}");

		self.showConfirmationPopupBox($popup, "Czy napewno chcesz usunąć wskazane wydarzenie?");

		ko.unapplyBindings($yesBtn[0]);
		ko.applyBindings(self, $yesBtn[0]);
	};

	self.prepareDeleteNoteDetailsPageOnDeleteLinkClick = function (id, year, month, day) {
		var $popup = $("#appContainer").children(".confirmation-popupbox");
		var $yesBtn = $popup.find(".confirmation-popupbox-yesbtn");
		$yesBtn.attr("data-bind", "click: function () { $root.deleteNoteDetailsPageOnConfirmationYesBtnClick($element, " + id + "," + year + "," + month + "," + day + ")}");

		self.showConfirmationPopupBox($popup, "Czy napewno chcesz usunąć wskazaną notatke?");

		ko.unapplyBindings($yesBtn[0]);
		ko.applyBindings(self, $yesBtn[0]);
	};

	self.deleteEventDetailsPageOnConfirmationYesBtnClick = function (element, id, year, month, day) {
		var webApi = self.UTILS.webApiCaller;
		//////////////////////////////////////////////
		//call WebAPI - Delete event with given id
		//////////////////////////////////////////////
		self.hideConfirmationPopupBox(element);
		self.UTILS.loader.show(true);

		webApi.callDeleteEvent(id).then(
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { success(data) }); },
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { error(data) }); })

		function success(result) {
			var $container, events, $tableBody, h, offset, $detailsDayTable;
			if (result.IsSuccess === false) {
				self.UTILS.loader.hide(true);
				//TODO: change alert to some error popop or error page...
				alert(result.Message);
			} else {
				self.UTILS.loader.hide(true);
				$container = $("#details .event-block-container[data-eventid='" + id + "']");
				$container.fadeOut(500, function () {
					$container.remove();
					self.EVENT_MANAGER.removeEvent(id, year, month, day, false);

					//redraw details page event rectangle table
					self.removeEventRectanglesFromDetailsDay();
					events = self.detailsPage.dayPlanPart.eventListVM.events();

					self.setCalendarPlacementRow(events);
					self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = 1;
					self.redrawCalendarCell(events, year, month, day);

					for (var i in events) {
						self.drawEventToDetailsDayTable(events[i]);
					}

					$detailsDayTable = $("#details #detailsDayTable");
					self.resizeDetailsDayTable(self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow);
					offset = $detailsDayTable.position().top - 83;
					$detailsDayTable.scrollTo(500, offset);
				});
			}

		}
		function error() {
			alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
			self.UTILS.loader.hide(true);
		}
	};

	self.deleteNoteDetailsPageOnConfirmationYesBtnClick = function (element, id, year, month, day) {
		var webApi = self.UTILS.webApiCaller;

		//////////////////////////////////////////////
		//call WebAPI - Delete note with given id
		//////////////////////////////////////////////
		self.hideConfirmationPopupBox(element);
		self.UTILS.loader.show(true);

		webApi.callDeleteNote(id).then(
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { success(data) }); },
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { error(data) }); })

		function success(result) {
			var $container;
			if (result.IsSuccess === false) {
				self.UTILS.loader.hide(true);
				//TODO: change alert to some error popop or error page...
				alert(result.Message);
			} else {
				self.UTILS.loader.hide(true);
				$container = $("#notesList li[data-noteid='" + id + "']");
				$container.fadeOut(500, function () {
					$container.remove();
					self.NOTE_MANAGER.removeNote(id, year, month, day);
				});
			}
		}
		function error() {
			alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
			self.UTILS.loader.hide(true);
			self.hideConfirmationPopupBox(element);
		}
	};

	self.editEventDetailsPageOnEditLinkClick = function (id, year, month, day) {
		var $details = $("#details");

		self.UTILS.loader.$overlay.show(true);

		var $addEventContainer = $("#addNewEventContainer");
		$addEventContainer.find(".popupbox-header-title").text("Edycja wydarzenia");

		var $addBtn = $addEventContainer.find("#btnAddNewEvent");
		$addBtn.attr("data-bind", "click: function(){ $root.saveEventOnClick(true) }")
		$addBtn.text("Zapisz zmiany");

		$addEventContainer.fadeIn();

		ko.unapplyBindings($addBtn[0]);
		ko.applyBindings(self, $addBtn[0]);

		var event = self.EVENT_MANAGER.getEventByDateAndId(id, year, month, day, self.myEventTree);

		//TODO: create Factory Method to fillout observebleEvent

		self.observableEvent.name(event.name);

		self.observableEvent.addedBy(event.addedBy);

		self.observableEvent.address.street(event.address.street);
		self.observableEvent.address.city(event.address.city);
		self.observableEvent.address.zipCode(event.address.zipCode);

		self.observableEvent.dateAdded = event.dateAdded;

		self.observableEvent.description(event.description);
		self.observableEvent.details(event.details);
		self.observableEvent.eventLengthInMinutes = event.eventLengthInMinutes;

		self.observableEvent.kind.value(event.kind.value);
		self.observableEvent.kind.name(event.kind.name);
		self.observableEvent.kind.color = self.UTILS.colorHelper.getEventColor(event.privacyLevel.value, self.observableEvent.kind.value);
		self.observableEvent.kind.headerColor = self.UTILS.colorHelper.getEventBoxHeaderColor(self.observableEvent.kind.value);
		self.observableEvent.kind.detailsPageEventBorderColor = self.UTILS.colorHelper.getEventDetailsBorderColor(self.observableEvent.kind.value);

		self.observableEvent.id = event.id;

		self.observableEvent.occupancyLimit(event.occupancyLimit);

		self.observableEvent.privacyLevel.name = event.privacyLevel.name;
		self.observableEvent.privacyLevel.value = event.privacyLevel.value;

		self.observableEvent.urlLink(event.urlLink);
		self.observableEvent.price(event.price);

		self.observableEvent.startDate.startMinute(event.startDate.startMinute);
		self.observableEvent.startDate.startHour(event.startDate.startHour);
		self.observableEvent.startDate.endMinute(event.startDate.endMinute);
		self.observableEvent.startDate.endHour(event.startDate.endHour);
		self.observableEvent.startDate.day(event.startDate.formatZero(event.startDate.day));
		self.observableEvent.startDate.month(event.startDate.formatZero(event.startDate.month));
		self.observableEvent.startDate.year(event.startDate.formatZero(event.startDate.year));

		//var docScroll = $("#slide-item-details").parent().scrollTop();
		//$addEventContainer.css("top", docScroll + 30);
		//$addEventContainer.show();
		$addEventContainer.find("#Event_Title").focus();
	};

	self.editNoteDetailsPageOnEditLinkClick = function (id, year, month, day) {
		var $editContainer = $("<div class='edit-mode-note-container'></div>");
		var $btns = $("<div style='text-align:center;font-size:18px;'><span class='green-color hover-cursor-pointer' style='padding:4px;'  data-bind='click:$root.updateNoteDetailsPageOnSaveLinkClick.bind($root," + id + ',' + year + ',' + month + ',' + day + ")'>zapisz</span><span class='red-color hover-cursor-pointer' style='padding:4px;' data-bind='click:$root.cancelEditNoteDetailsPageOnCancelLinkClick.bind($root," + id + ")'>anuluj</span></div>");
		var cancelLink = $btns.find(".red-color")[0];
		var saveLink = $btns.find(".green-color")[0];

		ko.unapplyBindings(cancelLink);
		ko.unapplyBindings(saveLink);
		ko.applyBindings(self, cancelLink);
		ko.applyBindings(self, saveLink);

		var $textbox = $("<textarea style='width: 100%;vertical-align: top;box-sizing: border-box;border: none;padding: 10px;background: #f3f3f3;height:100px;'/>");
		var $container = $("#notesListContainer li[data-noteid='" + id + "']");
		var noteText = $container.find("pre").text();
		$container.find(".note-content").hide();
		$textbox.val(noteText);
		$editContainer.append($textbox).append($btns);
		$container.append($editContainer).find("textarea").focus();
	};

	self.updateNoteDetailsPageOnSaveLinkClick = function (id, year, month, day) {
		var note, data, text, $container = $("#notesListContainer li[data-noteid='" + id + "']"), webApi = self.UTILS.webApiCaller;
		text = $container.find("textarea").val().trim();

		if (text == "") {
			return false;
		}

		note = self.NOTE_MANAGER.getNoteByDateAndId(id, year, month, day);

		if (!note) {
			return false;
		}

		data = 'Data=' + text + '&Id=' + id + '&IsLineThrough=' + !note.isLineThrough;

		//////////////////////////////////////////////
		//call WebAPI - Update note with given id
		//////////////////////////////////////////////
		self.UTILS.loader.show(true);

		webApi.callUpdateNote(data).then(
			function (data, textStatus, request) { webApigetResponse(data, request, function () { success(data) }); },
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { error(data) }); })

		function success(result) {
			if (result.IsSuccess === false) {
				self.UTILS.loader.hide(true);
				alert(result.Message);
			} else {
				note.data = text;
				$container.find("pre").text(text);
				$container.find(".edit-mode-note-container").remove();
				$container.find(".note-content").show();
				self.UTILS.loader.hide(true);
			}
		}
		function error() {
			alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
			self.UTILS.loader.hide(true);
		}
	};

	self.setLineThroughNoteDetailsPageOnLineThroughLinkClick = function (id, year, month, day, isLineThrough) {
		var data, note, text, $container = $("#notesListContainer li[data-noteid='" + id + "']"), webApi = self.UTILS.webApiCaller;

		note = self.NOTE_MANAGER.getNoteByDateAndId(id, self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(), self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(), self.detailsPage.dayPlanPart.dayPlanTableVM.date.day());

		if (!note) {
			return false;
		}

		text = note.data;
		data = 'Data=' + text + '&Id=' + id + '&IsLineThrough=' + isLineThrough;

		//////////////////////////////////////////////
		//call WebAPI - setLineThrough note with given id
		//////////////////////////////////////////////
		self.UTILS.loader.show(true);

		webApi.callUpdateNote(data).then(
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { success(data) }); },
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { error(data) }); })

		function success(result) {
			var isLineThrough;

			if (result.IsSuccess === false) {
				self.UTILS.loader.hide(true);
				alert(result.Message);
			} else {
				isLineThrough = !note.isLineThrough();
				self.UTILS.loader.hide(true);
				note.isLineThrough(isLineThrough);
			}
		}
		function error() {
			alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
			self.UTILS.loader.hide(true);
		}
	};

	self.cancelEditNoteDetailsPageOnCancelLinkClick = function (id) {
		var $container = $("#notesListContainer li[data-noteid='" + id + "']");
		$container.find(".edit-mode-note-container").remove();
		$container.find(".note-content").show();
	};

	self.redrawCalendarCell = function (dayEvents, year, month, day) {
		var monthClass;
		var calendarYear = self.calendarPage.calendarPart.calendarVM.displayDate.year(), calendarMonth = self.calendarPage.calendarPart.calendarVM.displayDate.month();

		if (year === calendarYear) {
			if (month === calendarMonth) {
				monthClass = ".day" + day;
			}
			else if (month === (calendarMonth - 1 || calendarMonth + 1)) {
				monthClass = ".other-month-day" + day;
			}
		}
		else if ((year === (calendarYear - 1) && month == 12) || (year === (calendarYear + 1) && month == 1)) {
			monthClass = ".other-month-day" + day;
		}

		removeEventRectangle(monthClass);

		for (var i = 0; i < dayEvents.length; i++) {
			self.drawEventToCalendar(dayEvents[i]);
		}

		function removeEventRectangle(cssClass) {
			var cellDay = cssClass;
			var $cellPlaceholder = $("#calendar").find(cellDay).find(".calendar-cell-placeholder");
			var $eventsToRemove = $cellPlaceholder.find(".event-rectangle");
			$eventsToRemove.remove();
		}
	}

	self.showConfirmationPopupBox = function ($popup, txt) {
		$popup.find(".confirmation-popupbox-maintext").text(txt);
		$("#appContainer").children(".app-page-overlay").show();
		$popup.show();
	};

	self.hideConfirmationPopupBox = function (element) {
		var $btn = $(element);
		var $popup = $btn.closest(".confirmation-popupbox");
		var $yesBtn = $popup.find(".confirmation-popupbox-yesbtn");
		$yesBtn.attr("data-bind", '');

		$popup.siblings(".app-page-overlay").hide();
		$popup.hide();

	};

	self.showSelectedJournalMenuItem = function (menuItemIndex) {
		if (self.detailsPage.journalPart.eventListVM.selectedMenuItem() === menuItemIndex) {
			return false;
		}

		var prop = self.detailsPage.journalPart.eventListVM.getSelectedEvents();
		prop.old([]);
		prop.upcoming([]);

		self.detailsPage.journalPart.eventListVM.selectedMenuItem(menuItemIndex);
		self.showSelectedEvents(self.detailsPage.journalPart.eventListVM.getSelectedEvents(), 'all', self.detailsPage.journalPart.eventListVM.selectedEventKindValues);

		if (!self.detailsPage.journalPart.eventListVM.isOpen()) {
			//self.hideDetailsPageClockContainer()
			self.detailsPage.journalPart.eventListVM.isOpen(true);
		}
	};

	self.showMoreOptionsInAddNewEventPopupOnClick = function (element) {
		var $element = $(element);
		var $moreOptionsContainer = $("#addNewEventContainer .more-options-container");

		if (!$element.hasClass("visible")) {
			$element.text("Ukryj dodatkowe opcje -");
			$moreOptionsContainer.slideDown();
		} else {
			$element.text("Pokaż więcej opcji +");
			$moreOptionsContainer.slideUp();
		}

		$element.toggleClass("visible");

	}

	self.showEventDetailsOnEventBlockClick = function (block) {
		$(block).closest(".event-block-container").scrollTo(500);
	};

	self.showTodayInDetailsPageCalendarDetailsTable = function () {
		self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = 1;

		self.detailsPage.dayPlanPart.dayPlanTableVM.date.day(self.todayDate.day);
		self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(self.todayDate.month);
		self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(self.todayDate.year);

		//Events
		var events = self.EVENT_MANAGER.getEventsForGivenDay(self.todayDate.year, self.todayDate.month, self.todayDate.day, self.myEventTree)
		self.detailsPage.dayPlanPart.eventListVM.events(events);

		//Notes
		var notes = self.NOTE_MANAGER.getNotesForGivenDay(self.todayDate.year, self.todayDate.month, self.todayDate.day)
		self.detailsPage.dayPlanPart.noteListVM.notes(notes);

		self.removeEventRectanglesFromDetailsDay();

		//Draw to detailsDayTable
		for (var i in events) {
			self.drawEventToDetailsDayTable(events[i]);
		}

		self.resizeDetailsDayTable(self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow);

		var $detailsDayTable = $("#details #detailsDayTable");
		var offset = $detailsDayTable.position().top - 83;

		$detailsDayTable.scrollTo(500, offset);
	}

	self.changeEventCountTreeValueBasedOnEventKind = function (countTree, event, value) {
		var old, upcoming, today, endDate;
		var eventTreeCountNode = countTree[event.kind.value];

		//TODO: is eventTreeCountNode always true?
		if (eventTreeCountNode) {
			old = eventTreeCountNode.old();
			upcoming = eventTreeCountNode.upcoming();

			today = new Date();
			endDate = new Date(event.startDate.year, event.startDate.month - 1, event.startDate.day, event.startDate.endHour, event.startDate.endMinute, 0, 0);

			if (today > endDate) {
				eventTreeCountNode.old(old + value);
			} else {
				eventTreeCountNode.upcoming(upcoming + value);
			}
		}
	}

	self.drawEventsToCalendar = function () {
		// current month
		drawEvents(self.myEventTree[self.calendarPage.calendarPart.calendarVM.displayDate.year()], self.calendarPage.calendarPart.calendarVM.displayDate.month());

		// prev months
		if (self.calendarPage.calendarPart.calendarVM.displayDate.month() === 1) {
			drawEvents(self.myEventTree[self.calendarPage.calendarPart.calendarVM.displayDate.year() - 1], 12);
		}
		else {
			drawEvents(self.myEventTree[self.calendarPage.calendarPart.calendarVM.displayDate.year()], self.calendarPage.calendarPart.calendarVM.displayDate.month() - 1);
		}

		// next month
		if (self.calendarPage.calendarPart.calendarVM.displayDate.month() == 12) {
			drawEvents(self.myEventTree[self.calendarPage.calendarPart.calendarVM.displayDate.year() + 1], 1);
		}
		else {
			drawEvents(self.myEventTree[self.calendarPage.calendarPart.calendarVM.displayDate.year()], self.calendarPage.calendarPart.calendarVM.displayDate.month() + 1);
		}

		function drawEvents(yearNode, calendarPageMonth) {
			var monthNode, days, events;

			if (yearNode) {
				monthNode = yearNode[calendarPageMonth];
				if (monthNode) {
					for (days in monthNode) {
						events = monthNode[days];
						for (var i = 0; i < events.length; i++) {
							self.drawEventToCalendar(events[i]);
						}
					}
				}
			}
		}
	}

	self.drawEventToCalendar = function (event) {
		var cellDay, $cell, $cellPlaceholder;

		if (event.startDate.year == self.calendarPage.calendarPart.calendarVM.displayDate.year()) {
			if (event.startDate.month === self.calendarPage.calendarPart.calendarVM.displayDate.month()) {
				cellDay = ".day" + parseInt(event.startDate.day, 10);
			}
			else if (event.startDate.month < self.calendarPage.calendarPart.calendarVM.displayDate.month()) {
				cellDay = ".prev-month-cell.other-month-day" + parseInt(event.startDate.day, 10);
			}
			else if (event.startDate.month > self.calendarPage.calendarPart.calendarVM.displayDate.month()) {
				cellDay = ".next-month-cell.other-month-day" + parseInt(event.startDate.day, 10);
			}
		}
		else if (event.startDate.year > self.calendarPage.calendarPart.calendarVM.displayDate.year()) {
			cellDay = ".next-month-cell.other-month-day" + parseInt(event.startDate.day, 10);
		}
		else if (event.startDate.year < self.calendarPage.calendarPart.calendarVM.displayDate.year()) {
			cellDay = ".prev-month-cell.other-month-day" + parseInt(event.startDate.day, 10);
		}

		$cell = $("#calendar").find(cellDay);
		$cellPlaceholder = $cell.find(".calendar-cell-placeholder");

		if ($cellPlaceholder.length == 0) {
			return false;
		}

		//TODO: using const here, better to calculate it 
		var percentWidthBetweenLines = 6.8;
		var minutePercentage = 6.8 / 60;

		var cellLineStart = ".cell-line" + event.startDate.startHour;
		var cellLineEnd = ".cell-line" + event.startDate.endHour;
		var $cellLineStart = $cellPlaceholder.find(cellLineStart);

		var hourOffset = parseFloat($cellLineStart[0].style.left);

		var left = hourOffset + (event.startDate.startMinute * minutePercentage);
		var width = minutePercentage * event.eventLengthInMinutes;

		var addressStreetStr = event.address.street ? event.address.street : "";
		var addressCityStr = event.address.city ? ", " + event.address.city : "";
		var addressStr = addressStreetStr + addressCityStr;

		var name = event.privacyLevel.value == self.eventPrivacyLevels["private"] ? event.name : ("*** " + event.name);

		var weekday = $cell.data("weekday");

		var $event = $('<div class="event-rectangle" style="top:' + (event.calendarPlacementRow - 1) * 28 + 'px; left:' +
			left + '%; width:' + width + '%;border-color:' + event.kind.color +
			';" data-name="' + name +
			'" data-address="' + addressStr +
			'" data-starthour="' + event.startDate.startHour +
			'" data-endhour="' + event.startDate.endHour +
			'" data-startminute="' + event.startDate.startMinute +
			'" data-endminute="' + event.startDate.endMinute +
			'" data-weekday="' + weekday + '">' + name +
			'</div>');

		$cellPlaceholder.append($event);
	};

	self.drawEventToDetailsDayTable = function (event, onAppInit) {
		//TODO: inject self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow into the method

		//set detailsPageBottomRow to calculate detailsPageEventsTable height based on the most bottom event.calendarPlacementRow 
		if (event.calendarPlacementRow > self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow) {
			self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = event.calendarPlacementRow;
		}

		var startMinuteOffset = event.startDate.startMinute / 60 * 100;
		var endMinuteOffset = event.startDate.endMinute / 60 * 100;
		var width = ((event.startDate.endHour - event.startDate.startHour) * 100) - startMinuteOffset + endMinuteOffset;

		var $hourCell = $(".hour-cell-" + event.startDate.startHour);
		var name = event.privacyLevel.value == 1 ? event.name : "*** " + event.name;
		var eventRectangle = '<div data-bind="click: function(){ $root.showEventBlockInfoOnDetailsPageEventRectangleClick(' + event.id + ') }" class="event-rectangle-details" style="width:' + (width - 2) + '%;top : ' + (((event.calendarPlacementRow - 1) * 46) + 12) + 'px;left:' + (startMinuteOffset + 1) + '%;border-color:' + event.kind.detailsPageEventBorderColor + ';"><span>' + name + '</span></div>';
		var $eventRectangle = $(eventRectangle);

		$eventRectangle.appendTo($hourCell);
		$eventRectangle.parent();

		ko.unapplyBindings($eventRectangle[0]);
		ko.applyBindings(self, $eventRectangle[0]);
	};

	self.removeEventRectanglesFromDetailsDay = function () {
		$("#details #detailsDayTable .event-rectangle-details").remove();
		self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = 1;
	};

	self.moveToDetailsPageOnCalendarCellClick = function (element) {
		self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = 1;
		var day = $(element).data("daynumber");
		var dayInt = parseInt(day, 10);
		self.detailsPage.dayPlanPart.dayPlanTableVM.date.day(dayInt);

		var $cell = $(element).closest(".calendar-cell");

		if ($cell.hasClass("prev-month-cell")) {
			if (self.calendarPage.calendarPart.calendarVM.displayDate.month() == 1) {
				self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(self.calendarPage.calendarPart.calendarVM.displayDate.year() - 1);
				self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(12);
			} else {
				self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(self.calendarPage.calendarPart.calendarVM.displayDate.year());
				self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(self.calendarPage.calendarPart.calendarVM.displayDate.month() - 1);
			}

		} else if ($cell.hasClass("next-month-cell")) {
			if (self.calendarPage.calendarPart.calendarVM.displayDate.month() == 12) {
				self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(self.calendarPage.calendarPart.calendarVM.displayDate.year() + 1);
				self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(1);
			} else {
				self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(self.calendarPage.calendarPart.calendarVM.displayDate.year())
				self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(self.calendarPage.calendarPart.calendarVM.displayDate.month() + 1);
			}
		}
		else {
			self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(self.calendarPage.calendarPart.calendarVM.displayDate.year());
			self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(self.calendarPage.calendarPart.calendarVM.displayDate.month());
		}

		var notes = self.NOTE_MANAGER.getNotesForGivenDay(self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(), self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(), self.detailsPage.dayPlanPart.dayPlanTableVM.date.day())
		self.detailsPage.dayPlanPart.noteListVM.notes(notes);

		var events = self.EVENT_MANAGER.getEventsForGivenDay(self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(), self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(), self.detailsPage.dayPlanPart.dayPlanTableVM.date.day(), self.myEventTree)
		self.detailsPage.dayPlanPart.eventListVM.events(events);

		self.removeEventRectanglesFromDetailsDay();

		for (var i in events) {
			self.drawEventToDetailsDayTable(events[i]);
		}

		self.resizeDetailsDayTable(self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow)

		var $scrollable = $("#slide-item-details").parent();

		window.location = "#2";

		setTimeout(function () {
			$("#details #calendarDayDetailsContainer").scrollTo(1000, 50);

		}, 10)
	};

	self.resizeDetailsDayTable = function (eventMostBottomRow) {
		var $tableBody = $("#details .details-day-table-body");
		var h = (eventMostBottomRow * 46) + 20;
		$tableBody.height(h + "px");
	}

	self.addPublicEventToMyCalendarOnClick = function (element, id, year, month, day) {
		var data = 'Username=' + self.userName + '&EventId=' + id, webApi = self.UTILS.webApiCaller;

		//////////////////////////////////////////////
		//call WebAPI - add existing event to user
		//////////////////////////////////////////////
		self.UTILS.loader.show(true);

		webApi.callAddExistingEventToUser(data).then(
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { success(data) }); },
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { error(data) }); })

		function success(result) {
			var displayDate, kkEvent, dayEvents;

			if (result.IsSuccess === false) {
				self.UTILS.loader.hide(true);
				alert(result.Message);
			} else {
				kkEvent = self.EVENT_MANAGER.getEventByDateAndId(id, year, month, day, self.publicEventTree);
				kkEvent.isEventAddedToCurrentUserCalendar(true);

				dayEvents = self.EVENT_MANAGER.addEvent(kkEvent);

				self.setCalendarPlacementRow(dayEvents);
				self.redrawCalendarCell(dayEvents, kkEvent.startDate.year, kkEvent.startDate.month, kkEvent.startDate.day);

				self.UTILS.loader.hide(true);
			}
		}
		function error() {
			alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
			self.UTILS.loader.hide(true);
		}
	}

	self.signUpUserForEventOnClick = function (element, id, year, month, day) {
		var data = 'Username=' + self.userName + '&EventId=' + id, webApi = self.UTILS.webApiCaller;

		//////////////////////////////////////////////
		//call WebAPI - sign up user for event
		//////////////////////////////////////////////
		self.UTILS.loader.show(true);

		webApi.callSignUpUserForEvent(data).then(
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { success(data) }); },
			function (data, textStatus, request) { webApi.interceptResponse(data, request, function () { error(data) }); })

		function success(result) {
			var dayEvents, kkEvent;

			if (result.IsSuccess === false) {
				self.UTILS.loader.hide(true);
				alert(result.Message);
			} else {
				kkEvent = self.EVENT_MANAGER.getEventByDateAndId(id, year, month, day, self.publicEventTree);
				kkEvent.signedUpUsersForEvent.push(self.userName);
				kkEvent.isCurrentUserSignedUpForEvent(true);

				if (!kkEvent.isEventAddedToCurrentUserCalendar()) {
					kkEvent.isEventAddedToCurrentUserCalendar(true);
					dayEvents = self.EVENT_MANAGER.addEvent(kkEvent);

					self.setCalendarPlacementRow(dayEvents);
					self.redrawCalendarCell(dayEvents, kkEvent.startDate.year, kkEvent.startDate.month, kkEvent.startDate.day);
				}

				self.UTILS.loader.hide(true);
			}

		}
		function error() {
			alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
			self.UTILS.loader.hide(true);
		}
	}

	self.showAllEventsOnClick = function (menuObj) {
		var $menuItemContainer = self.currentPage() === 0 ? $('#lobby .menu-item-container') : $('#details .menu-item-container');

		menuObj.selectedEventKindValues = [0, 1, 2, 3, 4, 5, 6];
		$menuItemContainer.css("top", "20px").addClass('selected');
		self.showSelectedEvents(menuObj.getSelectedEvents(), 'all', [0, 1, 2, 3, 4, 5, 6]);
	}

	self.showSelectedEventsOnEventTileClick = function (element, eventKindValue, selectedEventsProp, menuObj) {
		var $menuItemContainer = $(element);
		var $menuItem = $menuItemContainer.find(".menu-item");

		$menuItemContainer.toggleClass("selected");

		if ($menuItemContainer.hasClass("selected")) {
			$menuItemContainer.css("top", "20px");
			menuObj.selectedEventKindValues.push(eventKindValue);
			self.showSelectedEvents(selectedEventsProp, 'all', [eventKindValue]);
		} else {
			$menuItemContainer.css("top", "0px");
			menuObj.selectedEventKindValues = menuObj.selectedEventKindValues.filter(function (e) { return e !== eventKindValue });
			self.removeSelectedEvents(selectedEventsProp, eventKindValue);
		}

		$(".upcoming-events-part").scrollTo(500, 0);
	};

	self.showSelectedEvents = function (selectedEventsProp, oldOrUpcoming, valuesArr) {
		var checkArgs;

		// details page
		if (self.currentPage() == 2) {
			if (!self.detailsPage.journalPart.eventListVM.isOpen()) {
				//self.hideDetailsPageClockContainer();
				self.detailsPage.journalPart.eventListVM.isOpen(true);
			}

			switch (self.detailsPage.journalPart.eventListVM.selectedMenuItem()) {
				case 1:
					// parameter for simpleFilt.checkIf() method
					checkArgs = function (actualObj) {
						return [{ "prop": actualObj.kind.value, "values": valuesArr }]
					}

					//////////////////////////////////////////////////////////
					//old
					//////////////////////////////////////////////////////////
					if ((oldOrUpcoming == 'old' || oldOrUpcoming == 'all')) {
						if (self.detailsPage.journalPart.eventListVM.menuItems.myCalendar.showOld()) {
							show('old', selectedEventsProp.old, checkArgs, self.myEventTree);
						} else {
							selectedEventsProp.old([]);
						}
					}

					//////////////////////////////////////////////////////////
					//upcoming
					//////////////////////////////////////////////////////////
					if ((oldOrUpcoming == 'upcoming' || oldOrUpcoming == 'all')) {
						if (self.detailsPage.journalPart.eventListVM.menuItems.myCalendar.showUpcoming()) {
							show('upcoming', selectedEventsProp.upcoming, checkArgs, self.myEventTree);
						} else {
							selectedEventsProp.upcoming([]);
						}
					}
					break;
				case 2:
					// parameter for checkIf method
					checkArgs = function (actualObj, username) {
						return [{ "prop": actualObj.kind.value, "values": valuesArr }, { "boolSpecifier": 'and', "prop": actualObj.addedBy, "values": [username] }]
					}
					//////////////////////////////////////////////////////////
					//old
					//////////////////////////////////////////////////////////
					if ((oldOrUpcoming == 'old' || oldOrUpcoming == 'all')) {
						if (self.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.showOld()) {
							show('old', selectedEventsProp.old, checkArgs, self.publicEventTree);
						} else {
							selectedEventsProp.old([]);
						}
					}

					//////////////////////////////////////////////////////////
					//upcoming
					//////////////////////////////////////////////////////////
					if ((oldOrUpcoming == 'upcoming' || oldOrUpcoming == 'all')) {
						if (self.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.showUpcoming()) {
							show('upcoming', selectedEventsProp.upcoming, checkArgs, self.publicEventTree);
						} else {
							selectedEventsProp.upcoming([]);
						}
					}
					break;
				default:
					return;
			}

		}
		// lobby page
		else {
			if (!self.lobbyPage.upcomingEventsPart.eventListVM.isOpen()) {
				self.lobbyPage.upcomingEventsPart.eventListVM.isOpen(true);
			}

			// parameter for simpleFilt.checkIf() method
			checkArgs = function (actualObj) {
				return [{ "prop": actualObj.kind.value, "values": valuesArr }]
			}

			//////////////////////////////////////////////////////////
			//old
			//////////////////////////////////////////////////////////
			if ((oldOrUpcoming == 'old' || oldOrUpcoming == 'all')) {
				if (self.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.showOld()) {
					show('old', selectedEventsProp.old, checkArgs, self.publicEventTree);
				} else {
					selectedEventsProp.old([]);
				}
			}

			//////////////////////////////////////////////////////////
			//upcoming
			//////////////////////////////////////////////////////////
			if ((oldOrUpcoming == 'upcoming' || oldOrUpcoming == 'all')) {
				if (self.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.showUpcoming()) {
					show('upcoming', selectedEventsProp.upcoming, checkArgs, self.publicEventTree);
				} else {
					selectedEventsProp.upcoming([]);
				}
			}
		}

		function show(oldOrUpcomingFlag, selectedEventsProp, checkArgs, eventTree) {
			var shownEvents, combinedArray;
			var arr = self.EVENT_MANAGER.getEventsByPropertyValue(eventTree, checkArgs, oldOrUpcomingFlag);
			shownEvents = selectedEventsProp();

			if (shownEvents.length) {
				combinedArray = arr.concat(shownEvents);

				//TODO: instead of concating arrays and then sorting, insert each new event at correct index;
				combinedArray.sort(function (a, b) {
					return (a.startDate.javaScriptStartDate - b.startDate.javaScriptStartDate);
				});

				selectedEventsProp(combinedArray);
			} else {
				selectedEventsProp(arr);
			}
		}
	}

	self.removeSelectedEvents = function (selectedEvents, eventKindValue) {
		var array;

		switch (self.currentPage()) {
			case 0:
				//////////////////////////////////////////////////////////
				//old
				//////////////////////////////////////////////////////////
				if (self.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.showOld()) {
					array = ko.utils.arrayFilter(selectedEvents.old(), function (item) {
						return item.kind.value != eventKindValue;
					});

					selectedEvents.old(array);
				}

				//////////////////////////////////////////////////////////
				//upcoming
				//////////////////////////////////////////////////////////
				if (self.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.showUpcoming()) {
					array = ko.utils.arrayFilter(selectedEvents.upcoming(), function (item) {
						return item.kind.value != eventKindValue;
					});

					selectedEvents.upcoming(array);
				}

				if (!$("#lobby .menu-item-container").hasClass("selected")) {
					self.lobbyPage.upcomingEventsPart.eventListVM.isOpen(false);
				}

				break;
			case 2:
				switch (self.detailsPage.journalPart.eventListVM.selectedMenuItem()) {
					case 1:
						//////////////////////////////////////////////////////////
						//old
						//////////////////////////////////////////////////////////
						if (self.detailsPage.journalPart.eventListVM.menuItems.myCalendar.showOld()) {
							array = ko.utils.arrayFilter(selectedEvents.old(), function (item) {
								return item.kind.value !== eventKindValue;
							});

							selectedEvents.old(array);
						}

						//////////////////////////////////////////////////////////
						//upcoming
						//////////////////////////////////////////////////////////
						if (self.detailsPage.journalPart.eventListVM.menuItems.myCalendar.showUpcoming()) {
							array = ko.utils.arrayFilter(selectedEvents.upcoming(), function (item) {
								return item.kind.value != eventKindValue;
							});

							selectedEvents.upcoming(array);
						}
						break;
					case 2:
						//////////////////////////////////////////////////////////
						//old
						//////////////////////////////////////////////////////////
						if (self.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.showOld()) {
							array = ko.utils.arrayFilter(selectedEvents.old(), function (item) {
								return item.kind.value !== eventKindValue;
							});

							selectedEvents.old(array);
						}

						//////////////////////////////////////////////////////////
						//upcoming
						//////////////////////////////////////////////////////////
						if (self.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.showUpcoming()) {
							array = ko.utils.arrayFilter(selectedEvents.upcoming(), function (item) {
								return item.kind.value != eventKindValue;
							});

							selectedEvents.upcoming(array);
						}
						break;
					default:
						return;
				}

				if (!$("#details .menu-item-container").hasClass("selected")) {
					self.detailsPage.journalPart.eventListVM.isOpen(false);
					self.showDetailsPageClockContainer();
					self.detailsPage.journalPart.eventListVM.selectedMenuItem(1);
				}

				break;
			default:
				return;
		}
	}

	self.moveToDetailsDayOnEventCalendarIconClick = function (id, year, month, day) {
		self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = 1;

		self.detailsPage.dayPlanPart.dayPlanTableVM.date.day(day);
		self.detailsPage.dayPlanPart.dayPlanTableVM.date.year(year);
		self.detailsPage.dayPlanPart.dayPlanTableVM.date.month(month);

		var notes = self.NOTE_MANAGER.getNotesForGivenDay(year, month, day)
		self.detailsPage.dayPlanPart.noteListVM.notes(notes);

		var events = self.EVENT_MANAGER.getEventsForGivenDay(year, month, day, self.myEventTree)
		self.detailsPage.dayPlanPart.eventListVM.events(events);

		self.removeEventRectanglesFromDetailsDay();

		for (var i in events) {
			self.drawEventToDetailsDayTable(events[i]);
		}

		self.resizeDetailsDayTable(self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow);

		var speed = 800;
		if (self.currentPage() == 0) {
			window.location = "#2";
			speed = 100;
		}

		setTimeout(function () {
			$("#details .event-block-container[data-eventid='" + id + "']").scrollTo(speed);
		}, 10)
	};

	self.expandUpdateProfileForm = function (element) {
		var $cont = $("#details #updateProfileContainer");
		$cont.find("ol").slideDown();

		$cont.find("#updateUserFormBtn").show();

		$(element).hide();
		$cont.find("#hideBtnUpdateProfile").show();
	}

	self.hideUpdateProfileForm = function (element) {
		var $cont = $("#details #updateProfileContainer");
		$cont.find("#updateUserFormBtn").hide();
		$cont.find("ol").slideUp();

		$(element).hide();
		$cont.find("#expandBtnUpdateProfile").show();

	}

	self.closeAddNewEventPopupOnClick = function () {
		var $cont = $("#addNewEventContainer");
		$("#appContainer").children(".app-page-overlay").hide();
		$cont.hide();
		$cont.css("top", 30);
		//TODO:add scroll to top 
	};

	self.showRegisterFormOnClick = function () {
		var $loginForm = $("#loginPageContainer");
		var $registerForm = $("#registerPageContainer");
		$loginForm.hide();
		$registerForm.fadeIn();
		$("#RegisterModel_UserName").focus();
		window.location = "/#0";

		setTimeout(function () {
			$registerForm.scrollTo(1000, 0);
		}, 10);

	};

	self.showLoginFormOnClick = function () {
		var $loginForm = $("#loginPageContainer");
		var $registerForm = $("#registerPageContainer");
		var $loginBtn = $loginForm.find("#loginFormBtn");
		var $username = $loginForm.find("#UserName");

		$registerForm.hide();
		$loginForm.fadeIn();

		if ($username.val() !== '') {
			$loginBtn.focus();
		} else {
			$username.focus();
		}

		window.location = "/#0";

		setTimeout(function () {
			$loginForm.scrollTo(1000, 0);
		}, 10);
	};

	self.loginUserOnClick = function () {
		var $loginForm = $("#lobby #loginForm");
		var $loginContainer = $("#lobby #loginPageContainer");
		var action = $loginForm.attr("action");

		$loginForm.validate().form();

		if ($loginForm.valid()) {
			$loginContainer.hide();
			$.ajax({
				url: action,
				type: "POST",
				beforeSend: self.UTILS.loader.show(true),
				data: $loginForm.serialize(),
				success: function (result) {
					if (result.validationError) {
						self.UTILS.loader.hide(false);
						$loginContainer.show();
						alert("Nazwa użytkownika lub hasło jest nieprawidłowe");
					} else {
						window.location = "/home";
					}
				},
				error: function () {
					self.UTILS.loader.hide(true);
					$loginContainer.show();
					alert("Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz.");
				}
			});
		}

		return false;
	};

	self.expandEventOverviewItemOnClick = function (element) {
		var $element = $(element);
		var $expandDiv = $element.siblings('.event-block-expand');
		$element.toggleClass("selected");

		if (!$element.hasClass("selected")) {
			$expandDiv.slideUp(function () {
				$element.scrollTo(500, 200);
			});
		}
		else {
			$expandDiv.slideDown();
			$element.scrollTo(500, 80);
		}
	}

	self.closeLoginPopupOnClick = function () {
		$("#loginPageContainer").hide();
		$("#lobbyLogo").scrollTo();
	};

	self.closeRegisterPopupOnClick = function () {
		$("#registerPageContainer").hide();
		$("#lobbyLogo").scrollTo();
	};

	self.registerUserOnClick = function () {
		//TODO: in _register page make sure we have labels corresponding to their form textboxes (basically check all pages with forms that their html is correct)
		//TODO: add ajax code to WebApiCaller.js class

		var $dateBirthValidationMsg;
		var $registerForm = $("#registerForm");
		$registerForm.find(".summary-validation-errors").empty();
		var action = $registerForm.attr("action");

		var day = $("#birthDateDayTxtBox").val();
		var month = $("#birthDateMonthTxtBox").val();
		var year = $("#birthDateYearTxtBox").val();

		if (!self.validateDate(day, month, year)) {
			$dateBirthValidationMsg = $("#lobby #registerPageContainer #birthDateValidationErrorMsg");
			$("#lobby #registerPageContainer .register-birthdate-txtbox").addClass("input-validation-error");
			$dateBirthValidationMsg.show();
			return false;
		}

		$registerForm.validate().form();

		if ($registerForm.valid()) {
			$.ajax({
				url: action,
				type: "POST",
				beforeSend: function () { self.UTILS.loader.show(true); $("#lobby #registerPageContainer").hide() },
				data: $registerForm.serialize(),
				success: function (result) {
					self.UTILS.loader.hide(false);

					if (result.isRegisterSuccess === false) {
						$("#lobby #registerPageContainer").show()
						displayErrors(result.errors);
					} else {
						window.location = "/home";
					}
				},
				error: function () {
					self.UTILS.loader.hide(true);
					$("#lobby #registerPageContainer").show()
					alert("Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz.");
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

	self.updateUserOnClick = function () {
		var $dateBirthValidationMsg;
		var $registerForm = $("#updateProfileForm");
		$registerForm.find(".summary-validation-errors").empty();
		var action = $registerForm.attr("action");

		var day = $("#birthDateDayTxtBoxUpdateProfile").val();
		var month = $("#birthDateMonthTxtBoxUpdateProfile").val();
		var year = $("#birthDateYearTxtBoxUpdateProfile").val();

		if (!self.validateDate(day, month, year)) {
			$dateBirthValidationMsg = $("#details #birthDateValidationErrorMsgUpdateProfile");
			$("#details .register-birthdate-txtbox").addClass("input-validation-error");
			$dateBirthValidationMsg.show();
			return false;
		}

		$registerForm.validate().form();

		if ($registerForm.valid()) {
			$.ajax({
				url: action,
				type: "POST",
				beforeSend: self.UTILS.loader.show(true),
				data: $registerForm.serialize() + "&RegisterModel.Password=DummyPassword&RegisterModel.ConfirmPassword=DummyPassword&RegisterModel.UserName=DummyUserName",
				success: function (result) {
					self.UTILS.loader.hide(true);

					if (result.IsSuccess === false) {
						alert(result.Message)
					}
				},
				error: function () {
					self.UTILS.loader.hide(true);
					alert("Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz.");
				}
			});
		};

		return false;

		//TODO: make sure errors are passed from the server (the same as in registerUser)
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
	}

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
	};

	self.showAddPrivateCalendarEventPopupOnClick = function (element, data, e) {
		var $calendar = $("#calendar");
		$(element).hide();
		self.UTILS.loader.$overlay.show(true);

		//////////////////////////////////////////////////
		var $addEventContainer = $("#addNewEventContainer");
		$addEventContainer.find(".popupbox-header-title").text("Dodaj do kalendarza");

		var $addBtn = $addEventContainer.find("#btnAddNewEvent");
		$addBtn.text("dodaj");
		$addBtn.attr("data-bind", "click: function(){ $root.saveEventOnClick() }")

		ko.unapplyBindings($addBtn[0]);
		ko.applyBindings(self, $addBtn[0]);
		///////////////////////////////////////////////////

		var $eventTitle = $addEventContainer.find("#Event_Title");

		var dayNumber = $(element).siblings(".day").text();
		dayNumber = dayNumber < 10 ? '0' + dayNumber : dayNumber;

		var currMonth = self.calendarPage.calendarPart.calendarVM.displayDate.month();
		var currYear = self.calendarPage.calendarPart.calendarVM.displayDate.year();

		var $cell = $(element).closest(".calendar-cell");
		if ($cell.hasClass("prev-month-cell")) {
			if (currMonth == 1) {
				currMonth = 12;
				currYear = currYear - 1;
			} else {
				currMonth = currMonth - 1;
			}
		}
		else if ($cell.hasClass("next-month-cell")) {
			if (currMonth == 12) {
				currMonth = 1;
				currYear = currYear + 1;
			} else {
				currMonth = currMonth + 1;
			}
		}

		var monthNumber = (currMonth) < 10 ? '0' + (currMonth) : currMonth;

		self.resetAndSetPrivacyLvlToObservableEvent(dayNumber, monthNumber, currYear, "private", self.eventPrivacyLevels["private"]);

		var top = $("#slide-item-calendar").parent().scrollTop();
		$addEventContainer.css("top", top + 10);
		$addEventContainer.fadeIn();
		$eventTitle.focus();

		if (e) {
			e.stopPropagation();
		}
	};

	self.showAddPublicEventPopupOnClick = function (element, data, e) {
		var day = self.todayDate.day < 10 ? '0' + self.todayDate.day : self.todayDate.day;
		var month = self.todayDate.month < 10 ? '0' + self.todayDate.month : self.todayDate.month;

		self.resetAndSetPrivacyLvlToObservableEvent(day, month, self.todayDate.year, "public", self.eventPrivacyLevels["public"]);

		///////////////////////////////////////////////////
		self.UTILS.loader.$overlay.show(true);

		var $addEventContainer = $("#addNewEventContainer");
		$addEventContainer.find(".popupbox-header-title").text("Stwórz publiczne wydarzenie");

		var $addBtn = $addEventContainer.find("#btnAddNewEvent");
		$addBtn.text("dodaj");
		$addBtn.attr("data-bind", "click: function(){ $root.saveEventOnClick() }")

		ko.unapplyBindings($addBtn[0]);
		ko.applyBindings(self, $addBtn[0]);
		///////////////////////////////////////////////////

		$addEventContainer.fadeIn();
		var $eventTitle = $addEventContainer.find("#Event_Title").focus();
	};

	self.showAddPrivateEventLobbyPopupOnClick = function (element, data, e) {
		var day = self.todayDate.day < 10 ? '0' + self.todayDate.day : self.todayDate.day;
		var month = self.todayDate.month < 10 ? '0' + self.todayDate.month : self.todayDate.month;

		self.resetAndSetPrivacyLvlToObservableEvent(day, month, self.todayDate.year, "private", self.eventPrivacyLevels["private"]);

		var $lobby = $("#lobby");
		var $calendar = $("#calendar");
		var $details = $("#details");

		$lobby.siblings(".app-page-overlay").hide();
		$calendar.siblings(".app-page-overlay").hide();
		$details.siblings(".app-page-overlay").hide();

		var $overlay = $lobby.siblings(".app-page-overlay");
		$overlay.css("opacity", 1);
		$overlay.show();

		//////////////////////////////////////////////////
		var $addEventContainer = $("#addNewEventContainer");
		$addEventContainer.detach().prependTo($lobby);
		$addEventContainer.find(".popupbox-header-title").text("Dodaj do kalendarza");

		var $addBtn = $addEventContainer.find("#btnAddNewEvent");
		$addBtn.find("span").text("+");
		$addBtn.attr("data-bind", "click: function(){ $root.saveEventOnClick() }")

		ko.unapplyBindings($addBtn[0]);
		ko.applyBindings(self, $addBtn[0]);
		///////////////////////////////////////////////////


		var top = $("#slide-item-lobby").parent().scrollTop();
		$addEventContainer.css("top", top + 30);
		$addEventContainer.fadeIn();
		$addEventContainer.find("#Event_Title").focus();
	};

	self.resetAndSetPrivacyLvlToObservableEvent = function (day, month, year, privacyName, privacyValue) {
		self.EVENT_MANAGER.resetKKEventModelObservable(self.observableEvent, day, month, year);
		self.observableEvent.privacyLevel.name = privacyName;
		self.observableEvent.privacyLevel.value = privacyValue;
	}

	self.redisplayCalendarAtChosenMonth = function (month) {
		var $calendar, $calendarWidgetBody;
		if (month == 0) {
			// from january to december previous year
			self.calendarPage.calendarPart.calendarVM.displayDate.month(12);
			self.redisplayCalendarAtChosenYear(self.calendarPage.calendarPart.calendarVM.displayDate.year() - 1);
			return;
		} else if (month == 13) {
			//from december to january next year
			self.calendarPage.calendarPart.calendarVM.displayDate.month(1);
			self.redisplayCalendarAtChosenYear(self.calendarPage.calendarPart.calendarVM.displayDate.year() + 1);
			return;
		}

		self.calendarPage.calendarPart.calendarVM.displayDate.month(month);

		$calendar = $("#calendar");
		$calendarWidgetBody = $("#calendarWidgetBody");

		self.UTILS.loader.show(false);

		ko.unapplyBindings($calendarWidgetBody[0]);
		$calendarWidgetBody.empty();

		//calendar widget accepts months as 0 - 11 format
		$calendarWidgetBody.calendarWidget({ month: month - 1, year: self.calendarPage.calendarPart.calendarVM.displayDate.year() });

		ko.applyBindings(self, $calendarWidgetBody[0]);

		for (var i = -1; i < 2; i++) {
			//December previous year
			if (self.calendarPage.calendarPart.calendarVM.displayDate.month() + i == 0) {
				self.calendarPage.calendarPart.calendarVM.monthEvents = self.EVENT_MANAGER.getEventsForGivenMonth(self.calendarPage.calendarPart.calendarVM.displayDate.year() - 1, 12, self.myEventTree);
			}
			//January next year
			else if (self.calendarPage.calendarPart.calendarVM.displayDate.month() + i == 13) {
				self.calendarPage.calendarPart.calendarVM.monthEvents = self.EVENT_MANAGER.getEventsForGivenMonth(self.calendarPage.calendarPart.calendarVM.displayDate.year() + 1, 1, self.myEventTree);
			}
			//all other months
			else {
				self.calendarPage.calendarPart.calendarVM.monthEvents = self.EVENT_MANAGER.getEventsForGivenMonth(self.calendarPage.calendarPart.calendarVM.displayDate.year(), self.calendarPage.calendarPart.calendarVM.displayDate.month() + i, self.myEventTree);
			}

			//draw to calendar
			ko.utils.arrayForEach(self.calendarPage.calendarPart.calendarVM.monthEvents, function (event) {
				self.drawEventToCalendar(event);
			});
		}

		self.UTILS.loader.hide(true);
	};

	self.redisplayCalendarAtChosenYear = function (year) {
		self.calendarPage.calendarPart.calendarVM.displayDate.year(year);
		self.redisplayCalendarAtChosenMonth(self.calendarPage.calendarPart.calendarVM.displayDate.month());
	};

	self.showEventBlockInfoOnDetailsPageEventRectangleClick = function (id) {
		var $eventItemList = $("#details .event-list-item-container[eventid='" + id + "'] .event-list-item");
		$eventItemList.addClass(".selected").scrollTo(500);
		self.expandEventOverviewItemOnClick($eventItemList[0]);
	};

	self.closeAllSelectedEventsListContainerOnClick = function () {
		var $menuItemContainer, $eventsMenuContainer;

		switch (self.currentPage()) {
			case 0:
				self.lobbyPage.upcomingEventsPart.eventListVM.isOpen(false);

				$eventsMenuContainer = $("#lobby .events-menu-container");
				$eventsMenuContainer.find(".menu-item-container").each(function () {
					$menuItemContainer = $(this);

					if ($menuItemContainer.hasClass("selected")) {
						$menuItemContainer.removeClass("selected");
						$menuItemContainer.css("top", "0px");
					}
				});

				self.lobbyPage.upcomingEventsPart.eventListVM.selectedEventKindValues = [];
				self.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.selectedEvents.old([]);
				self.lobbyPage.upcomingEventsPart.eventListVM.menuItems.publicEvents.selectedEvents.upcoming([]);

				$("#lobbyUpcomingEventsPartBody").scrollTo(500, 60);
				return true;
			case 2:
				self.detailsPage.journalPart.eventListVM.isOpen(false);
				self.showDetailsPageClockContainer();

				$eventsMenuContainer = $("#details .events-menu-container");
				$eventsMenuContainer.find(".menu-item-container").each(function () {
					$menuItemContainer = $(this);

					if ($menuItemContainer.hasClass("selected")) {
						$menuItemContainer.removeClass("selected");
						$menuItemContainer.css("top", "0px");
					}
				});

				self.detailsPage.journalPart.eventListVM.selectedEventKindValues = [];
				self.detailsPage.journalPart.eventListVM.menuItems.myCalendar.selectedEvents.old([]);
				self.detailsPage.journalPart.eventListVM.menuItems.myCalendar.selectedEvents.upcoming([]);
				self.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.selectedEvents.old([]);
				self.detailsPage.journalPart.eventListVM.menuItems.manageOwnPublicEvents.selectedEvents.upcoming([]);
				self.detailsPage.journalPart.eventListVM.selectedMenuItem(1);
				$("#journalPartBody").scrollTo(500, 60);
				return true;
			default: return false;
		}
	};

	self.setCalendarPlacementRow = function (dayEvents) {
		self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = 1;
		var anotherEvent;
		var eStartH, eEndH, eStartM, eEndM;
		var eventsInTheSameDayTemp = [];
		var event;

		for (var i in dayEvents) {
			event = dayEvents[i];
			event.calendarPlacementRow = 1;
			eStartH = event.startDate.startHour;
			eEndH = event.startDate.endHour;
			eStartM = event.startDate.startMinute;
			eEndM = event.startDate.endMinute

			for (var j = 0; j < eventsInTheSameDayTemp.length; j++) {
				anotherEvent = eventsInTheSameDayTemp[j];

				var aeStartH = anotherEvent.startDate.startHour;
				var aeEndH = anotherEvent.startDate.endHour;
				var aeStartM = anotherEvent.startDate.startMinute;
				var aeEndM = anotherEvent.startDate.endMinute

				//TODO: looks too complex, simplify it ;) good luck 
				var firstCheck = (eStartH > aeStartH && eStartH < aeEndH) || (aeStartH > eStartH && aeStartH < eEndH);
				var secondCheck = (eStartH == aeStartH && (eStartM > aeStartM && ((eStartH < aeEndH) || (eStartM < aeEndM))));
				var thirdCheck = (aeStartH == eStartH && (aeStartM > eStartM && ((aeStartH < eEndH) || (aeStartM < eEndM))));
				var fourthCheck = (eStartH == aeStartH && eStartM == aeStartM) || (eEndH == aeEndH && eEndM == aeEndM);
				var fifthCheck = (eEndH == aeStartH && eEndM > aeStartM) || (aeEndH == eStartH && aeEndM > eStartM);

				if (firstCheck || secondCheck || thirdCheck || fourthCheck || fifthCheck) {
					//there is conflict

					if (event.calendarPlacementRow == anotherEvent.calendarPlacementRow) {
						event.calendarPlacementRow++;
					}
				}

				if (event.calendarPlacementRow > self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow) {
					self.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = event.calendarPlacementRow;
				}
			}

			eventsInTheSameDayTemp.push(event);

			//TODO: current sorting not optimal, correct way is to insert value at the correct index
			eventsInTheSameDayTemp.sort(function (a, b) {
				return parseInt(a.calendarPlacementRow, 10) - parseInt(b.calendarPlacementRow, 10)
			});

		}
	};

	self.drawAnalogClock = function () {
		var paper = Raphael("clockCanvas", 200, 160);
		//var clock = paper.circle(100,100,60);
		//clock.attr({"fill":"#000000"})  
		var hour_sign, hour_hand, minute_hand, second_hand;
		for (var i = 0; i < 12; i++) {
			var start_x = 100 + Math.round(50 * Math.cos(30 * i * Math.PI / 180));
			var start_y = 100 + Math.round(50 * Math.sin(30 * i * Math.PI / 180));
			var end_x = 100 + Math.round(55 * Math.cos(30 * i * Math.PI / 180));
			var end_y = 100 + Math.round(55 * Math.sin(30 * i * Math.PI / 180));
			hour_sign = paper.path("M" + start_x + " " + start_y + "L" + end_x + " " + end_y);
			hour_sign.attr({ stroke: "rgb(207, 199, 173)", "stroke-width": 1 });
		}
		hour_hand = paper.path("M100 100L100 60");
		hour_hand.attr({ stroke: "rgb(207, 199, 173)", "stroke-width": 6 });
		minute_hand = paper.path("M100 100L100 55");
		minute_hand.attr({ stroke: "rgb(207, 199, 173)", "stroke-width": 4 });
		second_hand = paper.path("M100 110L100 50");
		second_hand.attr({ stroke: "rgb(207, 199, 173)", "stroke-width": 1 });

		// var pin = paper.circle(100, 100, 10);
		// pin.attr({"fill":"#000000"});    

		update_clock()
		setInterval(function () { update_clock() }, 1000);


		function update_clock() {
			var now = new Date();
			var hours = now.getHours();
			var minutes = now.getMinutes();
			var seconds = now.getSeconds();
			hour_hand.rotate(30 * hours + (minutes / 2.5), 100, 100);
			minute_hand.rotate(6 * minutes, 100, 100);
			second_hand.rotate(6 * seconds, 100, 100);
		}
	};

	self.drawDigitalClock = function () {
		setInterval(function () { updateDigitalClock() }, 1000);

		function updateDigitalClock() {
			var currentTime = new Date();
			var currentHours = currentTime.getHours();
			var currentMinutes = currentTime.getMinutes();
			var currentSeconds = currentTime.getSeconds();

			// Pad the minutes and seconds with leading zeros, if required
			currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
			currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;
			currentHours = (currentHours < 10 ? "0" : "") + currentHours;
			// Choose either "AM" or "PM" as appropriate
			//var timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";

			// Convert the hours component to 12-hour format if needed
			//currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;

			// Convert an hours component of "0" to "12"
			//currentHours = (currentHours == 0) ? 0 : currentHours;

			// Compose the string for display
			var currentTimeString = currentHours + ":" + currentMinutes;


			$("#details #digitalClock").html(currentTimeString);

		}
	};

	self.showDetailsPageClockContainer = function () {
		$("#details #clockCanvas").fadeIn();
	};

	self.hideDetailsPageClockContainer = function () {
		$("#details #clockCanvas").hide();
	};

	self.switchDefaultTheme = function () {
		var themePrefix = "skin-theme-", $body = $("body");

		removeTheme($body, themePrefix);
		applyTheme($body, themePrefix);

		function removeTheme($rootElem, themePrefix) {
			var classArray = $rootElem.attr("class").split(" ");

			for (var i = 0; i < classArray.length; i++) {
				if (classArray[i].indexOf(themePrefix) !== -1) {
					$rootElem.removeClass(classArray[i]);
					return;
				}
			}
		}
		function applyTheme($rootElem, themePrefix) {
			self.currentSkinThemeIndex++;

			if (self.currentSkinThemeIndex === self.skinThemes.length) {
				self.currentSkinThemeIndex = 0;
			}

			$rootElem.addClass(themePrefix + self.skinThemes[self.currentSkinThemeIndex]);
		}
	}

	////////////////////////////////////////////////////////////

	self.dzieuoEvents = function () {
		var $dzVerticalPaging = $('#dzVerticalPaging');
		var $dzVerticalNav = $('#dzVerticalNav');
		var $loginbar = $("#loginBar");
		var $lobby = $("#lobby");

		$(document).bind("horizontal_transition:before", function (e, arg) {
			switch (arg.targetColumn) {
				case 0:
					$loginbar.css({ 'right': '18%' });
					break;
				case 1:
					$loginbar.css({ 'right': '8.5%' });
					break;
				case 2:
					$dzVerticalPaging.css({ 'right': '2%' });
					$dzVerticalNav.css({ 'right': '8.7%' });

					$loginbar.css({ 'right': '9.6%' });
					break;
				default:

			}

			switch (arg.currentColumn) {
				case 0:
					break;
				case 1:
					break;
				case 2:
					$dzVerticalPaging.css({ 'right': '8.5%' });
					$dzVerticalNav.css({ 'right': '16%' });
					break;
				default:

			}
		});

		$(document).bind("horizontal_transition:after", function (e, arg) {
			switch (arg.targetColumn) {
				case 0:
					// for js-masonry bug where sometimes masonry grid container does not render properly  
					window.dispatchEvent(new Event('resize'));
					break;
				case 1:
					break;
				case 2:
					break;
				default:
			}
		});

		$(document).bind("vertical_transition:after", function (e, arg) {
			switch (arg.targetRow) {
				case 0:
					$lobby.animate({ scrollTop: 0 }, "fast");
					break;
				default:
					break;
			}
		});

	}();

	//////////////////////////////////////////////////////
	// KO extention/helper methods
	//////////////////////////////////////////////////////

	ko.unapplyBindings = function (node) {
		// unbind events
		//$node.find("*").each(function () {
		//	$(this).unbind();
		//});

		// Remove KO subscriptions and references
		ko.cleanNode(node);
	};
}