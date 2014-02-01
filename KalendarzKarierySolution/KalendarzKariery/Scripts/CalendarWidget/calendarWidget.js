(function ($) {

	function calendarWidget($calendarBg, params) {

		var now = new Date();
		var today = now.getDate();
		var weekday = now.getDay();
		var thismonth = now.getMonth();
		var thisyear = now.getYear() + 1900;

		var opts = {
			month: thismonth,
			year: thisyear
		};

		$.extend(opts, params);

		var calendarDate = params;

		var monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Śierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
		var dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
		month = i = parseInt(opts.month);
		year = parseInt(opts.year);
		var m = 0;
		var calendar = '';

		calendar += ('<div id="calendar-menu-header">');

		calendar += ('<div style="width:100%;z-index:2;position:absolute;top:24px;border-top:1px solid rgb(221,221,221);border-bottom:1px solid rgb(247,247,247);"></div>');

		calendar += ('<div class="year-header-container"><span>Kalendarz Kariery</span></div>');
		calendar += ('<div class="month-name-header-container">');

		//calendar += ('<div class="calendar-eventSummary-btn"><img src="/images/Icons/list-icon.png" alt="triangle"/></div><div class="nav-prev" data-bind="click: $root.showPreviousMonthOnPrevMonthBtnClick" ><img src="/images/Icons/triangle-left.png" alt="triangle"/></div>');

		calendar += ('<div style="color:rgb(81, 228, 163);display:inline-block;font-size:18px;letter-spacing:1px;padding-top: 5px;padding-bottom: 4px;padding-right: 5px;padding-left: 5px;background:white;">' + today + '</div>');

		for (var j = 0; j < monthNames.length; j++) {

			if (j > 8) {
				if (j == calendarDate.month) {
					calendar += ('<div class="month-name-container current-month-name-calendar"><span data-bind="click: function(){ $root.redisplayCalendarAtChosenMonthOnClick($element) }" name="' + j + '">' + monthNames[j] + '</span></div>');
				} else {
					calendar += ('<div class="month-name-container"><span class="month-name-calendar" data-bind="click: function(){ $root.redisplayCalendarAtChosenMonthOnClick($element) }" name="' + j + '">' + monthNames[j] + '</span></div>');
				}
			} else {
				if (j == calendarDate.month) {
					calendar += ('<div class="month-name-container current-month-name-calendar"><span data-bind="click: function(){ $root.redisplayCalendarAtChosenMonthOnClick($element) }" name="' + j + '">' + monthNames[j] + '</span></div>');
				} else {
					calendar += ('<div class="month-name-container"><span class="month-name-calendar" data-bind="click: function(){ $root.redisplayCalendarAtChosenMonthOnClick($element) }" name="' + j + '">' + monthNames[j] + '</span></div>');
				}
			}
		}

		//calendar += ('<div class="nav-next" data-bind="click: $root.showNextMonthOnNextMonthBtnClick" ><img src="/images/Icons/triangle-right.png" alt="triangle"/></div>');

		calendar += ('<span class="year-name-container">' + year + '</span></div>');

		//calendar += ('<div class="menu-item-container inne-tab"><div class="border-item inne-border-tab"></div><div class="menu-item"><span>Inne</span></div></div><div class="menu-item-container spotkania-tab"><div class="border-item spotkania-border-tab"></div><div class="menu-item"><span>Spotkania</span></div></div><div class="menu-item-container kursy-tab"><div class="border-item kursy-border-tab"></div><div class="menu-item"><span>Kursy</span></div></div><div class="menu-item-container szkolenia-tab"><div class="border-item szkolenia-border-tab"></div><div class="menu-item"><span>Szkolenia</span></div></div><div class="menu-item-container zajecia-tab"><div class="border-item zajecia-border-tab"></div><div class="menu-item"><span>Zajęcia</span></div></div><div class="menu-item-container wydarzenia-tab"><div class="border-item wydarzenia-border-tab"></div><div class="menu-item"><span>Wydarzenia</span></div></div></div>');
		calendar += ('</div><div class="weekday-container" ' + 'id="calendar-month' + i + ' ">');

		for (var d = 0; d < 7; d++) {

			if (weekday - 1 === d) {
				calendar += '<div class="weekday current-weekday">' + dayNames[d] + '</div>';
			} else {
				calendar += '<div class="weekday">' + dayNames[d] + '</div>';
			}
		}

		calendar += '</div>';

		for (var d = 0; d < 7; d++) {
			calendar += '<div class="calendar-hours"><div class="calendar-hours-placeholder">';

			//for (var h = 7; h < 22; h += 2) {

			//	calendar += '<span class="hour">' + h + '</span>';

			//}

			calendar += '</div></div>';
		}

		var days = getDaysInMonth(month, year);
		var firstDayDate = new Date(year, month, 1);

		var prev_days = getDaysInMonth(month, year);
		var firstDay = firstDayDate.getDay();

		var prev_m = month == 0 ? 11 : month - 1;
		var prev_y = prev_m == 11 ? year - 1 : year;
		var prev_days = getDaysInMonth(prev_m, prev_y);
		firstDay = (firstDay == 0 && firstDayDate) ? 7 : firstDay;
		firstDay--;

		var i = 0;

		for (j = 0; j < 42; j++) {

			if (j % 7 == 0) {

				calendar += '<div class="calendar-row">';
			}

			if (j < firstDay) {
				calendar += ('<div class="other-month-cell calendar-cell"><div class="calendar-cell-placeholder"><div class="cell-span-container" style="position:relative;"><span class="day">' + (prev_days - firstDay + j + 1) + '</span><div class="addNewEvent-cellIcon dark-icon">+</div></div></div></div>');

			} else if (j >= firstDay + getDaysInMonth(month, year)) {
				i = i + 1;
				calendar += ('<div class="other-month-cell calendar-cell"><div class="calendar-cell-placeholder"><div class="cell-span-container" style="position:relative;"><span class="day">' + i + '</span><div class="addNewEvent-cellIcon dark-icon">+</div></div></div></div>');

			} else {
				calendar += ('<div class="current-month-cell  calendar-cell day' + (j - firstDay + 1) + '" dayNumber="' + (j - firstDay + 1) + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }"><div class="calendar-cell-placeholder"><div class="cell-span-container" style="position:relative;"><span class="day">' + (j - firstDay + 1) + '</span><div class="addNewEvent-cellIcon light-icon" >+</div></div></div></div>');
			}

			if (j % 7 == 6) calendar += ('</div>');
		}

		calendar += ('</div>');

		$calendarBg.html(calendar);

		drawLines();
		drawHours();

		$calendarBg.find('.day' + today).css({ "background": "white", "font-weight": "bold" }).addClass("today-cell");
	}

	function drawLines() {

		var $calendarHours = $(".calendar-hours");
		var $hoursPlaceholder = $calendarHours.find(".calendar-hours-placeholder");

		$("#calendar .calendar-cell").each(function (index) {

			var $placeholder = $(this).find(".calendar-cell-placeholder");

			//cell lines
			for (var i = 0.3; i < 15; i++) {
				var left = i * 6.8;
				$placeholder.append('<div style="left:' + left + '%;" class="cell-line' + (parseInt(i, 10) + 7) + ' cell-line-style"></div>');

			}
		});
	};
	function drawHours() {
		var $hoursPlaceholder = $(".calendar-hours").find(".calendar-hours-placeholder");

		//hours
		$hoursPlaceholder.each(function (index, item) {

			var counter = 0;

			for (var j = 7; j < 22; j += 2) {
				$(item).append('<div class="hour" style="left:' + ((counter + .4) * 6.4) + '%;"> ' + j + ' </div>');
				counter += 2;
			}

		});
	};
	function getDaysInMonth(month, year) {
		var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		if ((month == 1) && (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0))) {
			return 29;
		} else {
			return daysInMonth[month];
		}
	}

	// jQuery plugin initialisation
	$.fn.calendarWidget = function (params) {
		calendarWidget(this, params);
		return this;
	};



})(jQuery);
