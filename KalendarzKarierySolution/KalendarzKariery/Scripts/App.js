var APP = {
	init: function () {
		"use strict";

		initializeJQueryExtentionMethods();
		initializePagesHeights();

		function initializePagesHeights() {
			var height = $(window).height() - 30;
			$("#lobby").css("height", height);
			$("#details").css("height", height);
			$("#calendar").css("height", height);

		}
		function initializeJQueryExtentionMethods() {
			jQuery.fn.extend({
				scrollTo: function (speed, offset) {
					var $col, scrollTo;

					offset = offset || 0;

					$col = this.closest(".dz-column");
					scrollTo = this.offset().top - $col.offset().top + $col.scrollTop() - offset;
					$col.animate({ scrollTop: scrollTo }, speed);
				}
			});

			jQuery.extend({
				simpleFilt: SIMPLE_FILT()
			})
		}
	},
	start: function (indexViewModel) {
		"use strict";

		var appvm, $dzieuo = $('#dzieuo'), siteLoadingTextAnimationInterval = { interval: null };

		animateSiteLoadingText($("#appPageOverlayAtSiteLoadText"), siteLoadingTextAnimationInterval);
		createDzieuoSlider($dzieuo);
		createCalendarWidget();

		appvm = initializeAppViewModel(indexViewModel, indexViewModel.UserName, getLoadingSpinner());
		setUpHoverHandlers();
		setUpClickHandlers();
		setUpDateValidationErrorMsgDisplay();

		if (indexViewModel.IsUserAuthenticated) {
			drawToDetailsPageDayTable(appvm);
			appvm.drawEventsToCalendar();
		}

		displaySite(siteLoadingTextAnimationInterval, $dzieuo);

		function createDzieuoSlider($dzieuo) {
			$dzieuo.dzieuo({
				row_scroll_padding_top: 20,
				prev_arrow_content: '<img src="Images/arrow-left.png" alt="left navigation arrow" class="skin-prev-arrow">',
				next_arrow_content: '<img src="Images/arrow-right.png" alt="right navigation arrow" class="skin-next-arrow">',
				up_arrow_content: '<img src="Images/arrow-up.png" alt="up navigation arrow" class="skin-up-arrow">',
				down_arrow_content: '<img src="Images/arrow-down.png" alt="down navigation arrow" class="skin-down-arrow">'
			});
		};
		function createCalendarWidget() {
			var date = new Date();

			$("#calendarWidgetBody").calendarWidget({
				month: date.getMonth(), year: date.getFullYear()
			});
		}
		function animateSiteLoadingText($container, siteLoadingTextAnimationInterval) {
			var $spans, counter = 0;

			initializeSiteLoadingText($container);
			$spans = $container.children();

			siteLoadingTextAnimationInterval.interval = setInterval(function () { animate($spans) }, 50);

			function animate($spans) {
				if (counter > 0) {
					$spans[counter - 1].style.color = "gray";
				}
				else if (counter == 0) {
					$spans[$spans.length - 1].style.color = "gray";
				}

				if (counter != $spans.length) {
					$spans[counter].style.color = "#E4E4DA";
					counter++;
				} else {
					counter = 0;
				}
			}
			function initializeSiteLoadingText($container) {
				var textArr = ["Z", "N", "A", "J", "D", "Ź", " ", "C", "Z", "A", "S", " ", "N", "A", " ", "S", "U", "K", "C", "E", "S"];
				var spanOpened = "<span>", spanClosed = "</span>";
				var output = "";

				for (var i = 0; i < textArr.length; i++) {
					output += spanOpened + textArr[i] + spanClosed;
				}

				$container.html(output);
			}
		};
		function getLoadingSpinner() {
			//////////////////////////////////////////////////////////
			//ajax loader (spinner)
			//////////////////////////////////////////////////////////
			var opts = {
				lines: 17, // The number of lines to draw
				length: 6, // The length of each line
				width: 4, // The line thickness
				radius: 20, // The radius of the inner circle
				corners: 1, // Corner roundness (0..1)
				rotate: 0, // The rotation offset
				direction: 1, // 1: clockwise, -1: counterclockwise
				color: '#FFF', // #rgb or #rrggbb or array of colors
				speed: 2, // Rounds per second
				trail: 80, // Afterglow percentage
				shadow: false, // Whether to render a shadow
				hwaccel: false, // Whether to use hardware acceleration
				className: 'spinner', // The CSS class to assign to the spinner
				zIndex: 2e9, // The z-index (defaults to 2000000000)
				top: '50%', // Top position relative to parent
				left: '50%' // Left position relative to parent
			};

			var spinner = new Spinner(opts);
			var $target = $("#appSpinnerContainer");

			//Get the window height and width
			var winH = $(window).height();
			var winW = $(window).width();

			//Set the popup window to center
			$target.css('top', winH / 2 - $target.height() / 2);
			$target.css('left', winW / 2 - $target.width() / 2 - 20);
			return spinner;
		};
		function displaySite(siteLoadingTextAnimationInterval, $dzieuo) {
			//TODO: remove timeout and return promise from dzieuo plugin instead
			setTimeout(function () {
				clearInterval(siteLoadingTextAnimationInterval.interval);
				$("#appPageOverlayAtSiteLoad").hide();
				$dzieuo.css("visibility", "visible");
			}, 1050);
		};
		function initializeAppViewModel(indexViewModel, userName, spinner) {
			var date = new Date(), year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
			var appvm = new AppViewModel(userName, spinner);
			var UTILS = appvm.UTILS;
			var EVENT_MANAGER = appvm.EVENT_MANAGER;
			var NOTE_MANAGER = appvm.NOTE_MANAGER;

			initializeGeneralViewModelProperties();
			initializeLobbyPageViewModel();
			initializeDetailsPageViewModel();

			///////////////////////////////////////////////////////////////////
			//Knockout apply bindings
			///////////////////////////////////////////////////////////////////
			ko.applyBindings(appvm);
			///////////////////////////////////////////////////////////////////

			return appvm;

			function initializeGeneralViewModelProperties() {
				appvm.eventPrivacyLevels = UTILS.eventTreeBuilder.transformPrivacyLevels(indexViewModel.PrivacyLevels);
				appvm.eventKinds = indexViewModel.EventKinds;
				appvm.publicEventTree = UTILS.eventTreeBuilder.buildEventTree(indexViewModel.PublicEvents, true);

				if (indexViewModel.IsUserAuthenticated) {
					appvm.myEventTree = UTILS.eventTreeBuilder.buildEventTree(indexViewModel.MyEvents, false);
					appvm.myEventTreeCountBasedOnEventKind = UTILS.eventTreeBuilder.buildEventTreeCountBasedOnEventKind(indexViewModel.MyEventCountTree, appvm.eventKinds);
					appvm.myNoteTree = UTILS.eventTreeBuilder.buildNoteTree(indexViewModel.MyNotes);
				}
			}
			function initializeLobbyPageViewModel() {
				appvm.lobbyPage.upcomingEventsPart.publicEventTreeCountBasedOnEventKindVM = UTILS.eventTreeBuilder.buildEventTreeCountBasedOnEventKind(indexViewModel.PublicEventCountTree, appvm.eventKinds);
				appvm.lobbyPage.dashboardPart.recenlyAddedPublicEventsVM(getRecentlyAddedEvents(appvm));
				appvm.lobbyPage.dashboardPart.upcomingPublicEventsVM(UTILS.eventTreeBuilder.transformEventListToKKEventList(indexViewModel.UpcomingPublicEvents));

				if (indexViewModel.IsUserAuthenticated) {
					appvm.lobbyPage.dashboardPart.myCalendarVM.today(EVENT_MANAGER.getEventsForGivenDay(year, month + 1, day, appvm.myEventTree));
					appvm.lobbyPage.dashboardPart.myCalendarVM.tommorow(EVENT_MANAGER.getEventsForGivenDay(year, month + 1, day + 1, appvm.myEventTree));
					appvm.lobbyPage.dashboardPart.myCalendarVM.dayAfterTommorow(EVENT_MANAGER.getEventsForGivenDay(year, month + 1, day + 2, appvm.myEventTree));
				}

				function getRecentlyAddedEvents() {
					var recentlyAddedEvents = appvm.lobbyPage.eventGridPart.publicEventsVM.sort(function (event1, event2) {
						return event1.dateAdded.javaScriptDate - event2.dateAdded.javaScriptDate;
					});

					return recentlyAddedEvents.slice(Math.max(recentlyAddedEvents.length - 5, 1)).reverse();
				}
			}
			function initializeDetailsPageViewModel() {
				var events, notes;

				appvm.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow = 1;
				appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.year(date.getFullYear());
				appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.month(date.getMonth() + 1);
				appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.day(date.getDate());

				events = EVENT_MANAGER.getEventsForGivenDay(appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.year(), appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.month(), appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.day(), appvm.myEventTree)
				notes = NOTE_MANAGER.getNotesForGivenDay(appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.year(), appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.month(), appvm.detailsPage.dayPlanPart.dayPlanTableVM.date.day())
				appvm.detailsPage.dayPlanPart.eventListVM.events(events);
				appvm.detailsPage.dayPlanPart.noteListVM.notes(notes);
			}
		}
		function setUpHoverHandlers() {
			var $eventHoverContainer = $("#eventHoverContainer");
			var $appContainer = $("#appContainer");
			var tap = ("ontouchstart" in document.documentElement);

			//if (!tap) {
				$appContainer.on({
					mouseenter: function () {
						$(this).css({
							//"border-bottom": "2px solid rgb(235,235,235)",
							//"border-top": "2px solid rgb(250,250,250)",
							"cursor": "pointer",
							"top": "3px"
						}).find(".addNewEvent-cellIcon").fadeIn();
					},
					mouseleave: function () {
						$(this).css({
							//"border": "2px solid white",
							"cursor": "auto",
							"top": "0"
						}).find(".addNewEvent-cellIcon").hide();
					}
				}, '.current-month-cell');

				$appContainer.on({
					mouseenter: function () {
						$(this).css({
							"cursor": "pointer",
							"top": "3px"
						}).find(".addNewEvent-cellIcon").fadeIn();
					},
					mouseleave: function () {
						$(this).css({
							"cursor": "auto",
							"top": "0px"
						}).find(".addNewEvent-cellIcon").fadeOut();
					}
				}, '.other-month-cell');

				$appContainer.on({
					mouseenter: function () {
						var $this = $(this);
						var name = $this.data("name");
						var address = $this.data("address");
						var startHour = $this.data("starthour");
						var endHour = $this.data("endhour");
						var startMinute = $this.data("startminute");
						var endMinute = $this.data("endminute");
						var weekday = $this.data("weekday");

						var width = $this.width();
						var height = $this.height();
						var offset = $this.offset();

						// if is sunday hover box should be presented to the left of the event
						if (weekday == 6) {
							$eventHoverContainer.css("left", offset.left - 400);
						}
						else {
							$eventHoverContainer.css("left", offset.left - 100 + width);
						}


						$eventHoverContainer.css("top", offset.top - height);

						$eventHoverContainer.find(".event-hover-name").text(name);
						$eventHoverContainer.find(".event-hover-adress").text(address);
						$eventHoverContainer.find(".event-hover-startHour").text(startHour + " : " + startMinute);
						$eventHoverContainer.find(".event-hover-endHour").text(endHour + " : " + endMinute);

						$eventHoverContainer.show();
					},
					mouseleave: function () {
						$eventHoverContainer.hide();
					}
				}, '.event-rectangle');
			//}

			$appContainer.on({
				mouseenter: function () {
					$(this).css({
						"cursor": "pointer",
						"color": "black"
					});
				},
				mouseleave: function () {
					$(this).css({
						"cursor": "auto",
						"color": "#4C4C4C"
					});
				}
			}, '.event-rectangle-details');

			$appContainer.on({
				mouseenter: function () {
					$(this).css({
						"cursor": "pointer",
						"background": "#424242"
					}).find('.list-item-title').css("color", "white");
				},
				mouseleave: function () {
					var $this = $(this);
						if (!$this.hasClass("selected")) {
						$this.css({
							"cursor": "auto",
							"background": "#888181",
							"border-bottom" : ""
						});
					}
					$this.find('.list-item-title').css("color", "black");
				}
			}, '.event-list-item');

			//TODO: since also using css : hover, maybe remove jquery code?
			//$( ".hover-cursor-pointer" ).hover( function ()
			//{
			//	$( this ).css( {
			//		"cursor": "pointer"
			//	} );
			//}, function ()
			//{
			//	$( this ).css( {
			//		"cursor": "auto"
			//	} );
			//} );

			//TODO: since also using css : hover, maybe remove jquery code?
			//$( ".link" ).hover( function ()
			//{
			//	$( this ).css( {
			//		"cursor": "pointer"
			//	} );
			//}, function ()
			//{
			//	$( this ).css( {
			//		"cursor": "auto"
			//	} );
			//} );

			$appContainer.on({
				mouseenter: function () {
					var $this = $(this);
					if (!$this.hasClass("main-page-link")) {
						$this.toggleClass("selected");
						$this.parent().children().first().toggleClass("selected");
					}
				},
				mouseleave: function () {
					var $this = $(this);
					if (!$this.hasClass("main-page-link")) {
						$this.toggleClass("selected");
						$this.parent().children().first().toggleClass("selected");
					}
				}
			}, '.lobby-nav-link-container');

			$appContainer.on({
				mouseenter: function () {
					$(this).css("background", "white");
					$(this).css("border", "2px solid gray");

				},
				mouseleave: function () {
					$(this).css("background", "rgb(225,225,225)");
					$(this).css("border", "none");
				}
			}, '.light-icon');

			$appContainer.on({
				mouseenter: function () {
					$(this).css("background", "white");
					$(this).css("color", "black");
					$(this).css("border", "2px solid gray");
				},
				mouseleave: function () {
					$(this).css("background", "rgb(188,188,188)");
					$(this).css("color", "white");
					$(this).css("border", "none");
				}
			}, '.dark-icon');

			$appContainer.on({
				mouseenter: function () {
					$(this).css({
						"cursor": "pointer"
					});
				},
				mouseleave: function () {
					$(this).css({
						"cursor": "auto"
					});
				}
			}, ".month-name-calendar");

			//$appContainer.on( {
			//	mouseenter: function ()
			//	{
			//		$( this ).css( {
			//			"cursor": "pointer",
			//			"border-left": "2px solid gray"
			//		} );
			//	},
			//	mouseleave: function ()
			//	{
			//		$( this ).css( {
			//			"cursor": "auto",
			//			"border-left": "none"
			//		} );
			//	}
			//}, ".event-list-item-container" );


			$(".menu-item-container").hover(function () {
				var $this = $(this);

				$this.css({
					"cursor": "pointer"
				});
			}, function () {
					var $this = $(this);

					$this.css({
						"cursor": "auto"
					});
				});

			var $leftSideCalendar = $("#leftSideCalendar");
			var $rightSideCalendar = $("#rightSideCalendar");
			var $leftSideDetails = $("#leftSideDetails");
			var $rightSideLobby = $("#rightSideLobby");
			var $rightSideLobbyTopPart = $("#rightSideLobbyTopPart");

			$leftSideCalendar.hover(function () {
				$(this).css({
					"backgroundPosition": "left",
					"cursor": "pointer"
				});
			}, function () {
					$(this).css({
						"backgroundPosition": "right",
						"cursor": "auto"
					});
				});
			$("#calendar-navigation-arrows-left").hover(function () {
				$(this).css({
					"cursor": "pointer"
				});

				$leftSideCalendar.css({
					"backgroundPosition": "left"
				});
			}, function () {
					$(this).css({
						"cursor": "auto"
					});
					$leftSideCalendar.css({
						"backgroundPosition": "right"
					});
				});
			$rightSideCalendar.hover(function () {
				$(this).css({
					"backgroundPosition": "right",
					"cursor": "pointer"
				});
			}, function () {
					$(this).css({
						"backgroundPosition": "left",
						"cursor": "auto"
					});
				});
			$("#calendar-navigation-arrows-right").hover(function () {
				$(this).css({
					"cursor": "pointer"
				});

				$rightSideCalendar.css({
					"backgroundPosition": "right"
				});
			}, function () {
					$(this).css({
						"cursor": "auto"
					});
					$rightSideCalendar.css({
						"backgroundPosition": "left"

					});
				});

			$("#lobby-navigation-arrows-right").hover(function () {
				$(this).css({
					"cursor": "pointer"
				});

				$rightSideLobby.css({
					"backgroundPosition": "right"

				});

				$rightSideLobbyTopPart.css({
					"backgroundPosition": "right"

				});

			}, function () {
					$(this).css({
						"cursor": "auto"
					});
					$rightSideLobby.css({
						"backgroundPosition": "left"

					});

					$rightSideLobbyTopPart.css({
						"backgroundPosition": "left"

					});
				});

			$("#details-navigation-arrows-left").hover(function () {
				$(this).css({
					"cursor": "pointer"
				});

				$leftSideDetails.css({
					"backgroundPosition": "left"

				});
			}, function () {
					$(this).css({
						"cursor": "auto"
					});
					$leftSideDetails.css({
						"backgroundPosition": "right"

					});
				});
			$leftSideDetails.hover(function () {
				$(this).css({
					"backgroundPosition": "left",
					"cursor": "pointer"
				});
			}, function () {
					$(this).css({
						"backgroundPosition": "right",
						"cursor": "auto"
					});
				});

			$rightSideLobby.hover(function () {
				$(this).css({
					"backgroundPosition": "right",
					"cursor": "pointer"
				});

				$rightSideLobbyTopPart.css({
					"backgroundPosition": "right"

				});

			}, function () {
					$(this).css({
						"backgroundPosition": "left",
						"cursor": "auto"
					});

					$rightSideLobbyTopPart.css({
						"backgroundPosition": "left"

					});
				});

			$rightSideLobbyTopPart.hover(function () {
				$(this).css({
					"backgroundPosition": "right",
					"cursor": "pointer"
				});

				$rightSideLobby.css({
					"backgroundPosition": "right"

				});

			}, function () {
					$(this).css({
						"backgroundPosition": "left",
						"cursor": "auto"
					});

					$rightSideLobby.css({
						"backgroundPosition": "left"

					});
				});

			$("#btnAddNewEvent").hover(function () {
				$(this).css({
					"cursor": "pointer"
				});
			}, function () {
					$(this).css({
						"cursor": "auto"
					});
				});

			$(".login-link").hover(function () {
				$(this).css({
					"color": "rgb(73, 226, 140)"
				});
			}, function () {
					$(this).css({
						"color": "gray"
					});
				});

			$("#calendar .calendar-year-arrows").hover(function () {
				$(this).css({
					"cursor": "pointer"
				});

			}, function () {
					$(this).css({
						"cursor": "auto"
					});

				});

			$appContainer.on({
				mouseenter: function () {
					$(this).css({
						"font-style": "italic"
					});
				},
				mouseleave: function () {
					$(this).css({
						"font-style": "normal"
					});
				}
			}, ".event-block-user-option");

		};
		function setUpClickHandlers() {
			//register user
			var $txtbox = $("#registerPageContainer .register-birthdate-txtbox");
			$txtbox.keyup(function () {
				$("#registerPageContainer #birthDateValidationErrorMsg").hide();
				$txtbox.removeClass("input-validation-error");
			});

			var $appContainer = $("#appContainer");

			$appContainer.on("click", "#leftSideCalendar", function (event) {
				window.location = "#0";
			});
			$appContainer.on("click", "#calendar-navigation-arrows-left", function (event) {
				window.location = "#0";
			});
			$appContainer.on("click", "#rightSideCalendar", function (event) {
				window.location = "#2";
			});
			$appContainer.on("click", "#calendar-navigation-arrows-right", function (event) {
				window.location = "#2";
			});
			$appContainer.on("click", "#rightSideLobby", function (event) {
				window.location = "#1";
			});
			$appContainer.on("click", "#lobby-navigation-arrows-right", function (event) {
				window.location = "#1";
			});
			$appContainer.on("click", "#leftSideDetails", function (event) {
				window.location = "#1";
			});
			$appContainer.on("click", "#details-navigation-arrows-left", function (event) {
				window.location = "#1";
			});
		};
		function setUpDateValidationErrorMsgDisplay() {
			var $txtbox = $("#addNewEventContainer .event-startdate-txtbox");
			$txtbox.keyup(function () {
				$("#addNewEventContainer #dateValidationErrorMsg").hide();
				$txtbox.removeClass("input-validation-error");
			});

			var $endDate = $("#addNewEventContainer .end-date-selectbox");
			$endDate.change(function () {
				$endDate.removeClass("input-validation-error");
				$("#addNewEventContainer #endDateValidationErrorMsg").hide();
			});

			//to hide vertical paging when responsive mobile view
			$("#dzVerticalPaging").addClass("xs-hide");
		};
		function drawToDetailsPageDayTable(appvm) {
			//method drawEventToDetailsDayTable(events[i]) must be called after ko.applyBindings(appvm)!
			var events = appvm.detailsPage.dayPlanPart.eventListVM.events();
			for (var i in events) {
				appvm.drawEventToDetailsDayTable(events[i]);
			}

			appvm.resizeDetailsDayTable(appvm.detailsPage.dayPlanPart.dayPlanTableVM.eventMostBottomRow);
		}
	}
}