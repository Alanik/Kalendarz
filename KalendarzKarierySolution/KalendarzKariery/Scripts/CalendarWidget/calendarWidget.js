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

		var monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
		var dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
		month = i = parseInt(opts.month);
		year = parseInt(opts.year);
		var m = 0;
		var calendar = '';
		calendar += ('<div id="calendarMenuHeader">');
		calendar += ('<div style="width:100%;z-index:2;position:absolute;top:2px;border-top:1px solid rgb(221,221,221);border-bottom:1px solid rgb(247,247,247);"></div>');
		calendar += ('<div class="year-header-container"></div>');
		calendar += ('<div class="month-name-header-container">');
		calendar += ( '<div style="box-shadow:0px 5px 20px -5px rgb(151, 151, 151);color:rgb(223, 214, 189);display:inline-block;font-size:18px;letter-spacing:1px;padding-top: 5px;padding-bottom: 4px;padding-right: 14px;padding-left: 14px;background:white;">' + today + '</div>' );

		for (var j = 0; j < monthNames.length; j++) {

			if (j > 8) {
				if (j == calendarDate.month) {
					calendar += ('<div class="month-name-container current-month-name-calendar"><span data-bind="click: function(){ $root.redisplayCalendarAtChosenMonthOnClick($element) }" name="' + (j + 1) + '">' + monthNames[j] + '</span></div>');
				} else {
					calendar += ('<div class="month-name-container"><span class="month-name-calendar" data-bind="click: function(){ $root.redisplayCalendarAtChosenMonthOnClick($element) }" name="' + (j + 1) + '">' + monthNames[j] + '</span></div>');
				}
			} else {
				if (j == calendarDate.month) {
					calendar += ('<div class="month-name-container current-month-name-calendar"><span data-bind="click: function(){ $root.redisplayCalendarAtChosenMonthOnClick($element) }" name="' + (j + 1) + '">' + monthNames[j] + '</span></div>');
				} else {
					calendar += ('<div class="month-name-container"><span class="month-name-calendar" data-bind="click: function(){ $root.redisplayCalendarAtChosenMonthOnClick($element) }" name="' + (j + 1) + '">' + monthNames[j] + '</span></div>');
				}
			}
		}
		calendar += ('<span class="year-name-container">' + year + '</span></div>');
		calendar += ('</div><div class="weekday-container">');

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
		var weekdayModulo;
		var monthName;
		var currentDay;

		for (j = 0; j < 42; j++) {
			weekdayModulo = j % 7;

			if (weekdayModulo == 0) {
				calendar += '<div class="calendar-row">';
			}

			if (j < firstDay) {
				currentDay = (prev_days - firstDay + j + 1);
				if (j + 1 < firstDay) {
					calendar += ('<div class="other-month-cell other-month-day' + currentDay + ' prev-month-cell calendar-cell"  dayNumber="' + (prev_days - firstDay + j + 1) + '"  weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }"><div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + (prev_days - firstDay + j + 1) + '</span><div class="addNewEvent-cellIcon dark-icon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}">+</div></div></div></div>');
				} else {

					month = month == 0 ? 12 : month;

					calendar += ('<div class="other-month-cell other-month-day' + currentDay + ' prev-month-cell calendar-cell"  dayNumber="' + (prev_days - firstDay + j + 1) + '"  weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }"><div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + (prev_days - firstDay + j + 1) + '</span><span class="cell-month-name-span">' + monthNames[month - 1] + '</span><div class="addNewEvent-cellIcon dark-icon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}">+</div></div></div></div>');
				}

			} else if (j >= firstDay + days) {
				i = i + 1;
				if (i == 1) {
					month = month == 11 ? -1 : month;
					calendar += ('<div class="other-month-cell other-month-day' + i + ' next-month-cell calendar-cell" dayNumber="' + i + '"  weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }"><div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + i + '</span><span class="cell-month-name-span">' + monthNames[month + 1] + '</span><div class="addNewEvent-cellIcon dark-icon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}">+</div></div></div></div>');

				} else {
					calendar += ('<div class="other-month-cell other-month-day' + i + ' next-month-cell calendar-cell" dayNumber="' + i + '"  weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }"><div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + i + '</span><div class="addNewEvent-cellIcon dark-icon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}">+</div></div></div></div>');
				}

			} else {
				 currentDay = (j - firstDay + 1);
				month = month == 12 ? 0 : month;

				if (currentDay == 1) {
					calendar += ('<div class="current-month-cell  calendar-cell day' + currentDay + '" dayNumber="' + currentDay + '" weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }"><div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + currentDay + '</span><span class="cell-month-name-span">' + monthNames[month] + '</span><div class="addNewEvent-cellIcon light-icon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}">+</div></div></div></div>');
				} else {
					calendar += ('<div class="current-month-cell  calendar-cell day' + currentDay + '" dayNumber="' + currentDay + '" weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }"><div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + currentDay + '</span><div class="addNewEvent-cellIcon light-icon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}">+</div></div></div></div>');
				}
			}

			if (j % 7 == 6) calendar += ('</div>');
		}

		calendar += ('</div>');

		$calendarBg.html(calendar);

		drawLines();
		drawHours();

		if (now.getMonth() == month && now.getFullYear() == year) {
			$calendarBg.find('.day' + today).addClass("today-cell");
		}
	};

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

	// jQuery plugin initialization
	$.fn.calendarWidget = function (params) {
		calendarWidget(this, params);
		return this;
	};

})(jQuery);
