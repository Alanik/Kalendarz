(function ($) {

	function calendarWidget(el, params) {

		var now = new Date();
		var today = now.getDate();
		var thismonth = now.getMonth();
		var thisyear = now.getYear() + 1900;

		var opts = {
			month: thismonth,
			year: thisyear
		};

		$.extend(opts, params);

		var monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Śierpień', 'Wrzesień', 'Pażdziernik', 'Listopad', 'Grudzień'];
		var dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
		month = i = parseInt(opts.month);
		year = parseInt(opts.year);
		var m = 0;
		var calendar = '';

		calendar += ('<div id="calendar-menu-header">');

		// uncomment the following lines if you'd like to display calendar month based on 'month' and 'view' paramaters from the URL
		calendar += ('<div class="month-nav-container"><div class="nav-prev" data-bind="click: $root.showPreviousMonthOnPrevMonthBtnClick" ><<<</div><span class="month-name-calendar">' + monthNames[month] + '</span><div class="nav-next" data-bind="click: $root.showNextMonthOnNextMonthBtnClick" >>>></div></div>');

		calendar += ('<div class="menu-item-container inne-tab"><div class="border-item inne-border-tab"></div><div class="menu-item"><span>Inne</span></div></div><div class="menu-item-container spotkania-tab"><div class="border-item spotkania-border-tab"></div><div class="menu-item"><span>Spotkania</span></div></div><div class="menu-item-container kursy-tab"><div class="border-item kursy-border-tab"></div><div class="menu-item"><span>Kursy</span></div></div><div class="menu-item-container szkolenia-tab"><div class="border-item szkolenia-border-tab"></div><div class="menu-item"><span>Szkolenia</span></div></div><div class="menu-item-container zajecia-tab"><div class="border-item zajecia-border-tab"></div><div class="menu-item"><span>Zajęcia</span></div></div><div class="menu-item-container wydarzenia-tab"><div class="border-item wydarzenia-border-tab"></div><div class="menu-item"><span>Wydarzenia</span></div></div></div>');
		calendar += ('<div class="weekday-container" ' + 'id="calendar-month' + i + ' ">');

		for (d = 0; d < 7; d++) {
			calendar += '<div class="weekday">' + dayNames[d] + '</div>';
		}

		calendar += '</div>';

		for (d = 0; d < 7; d++) {
			calendar += '<div class="calendar-hours">';

			//for (var h = 7; h < 22; h += 2) {

			//	calendar += '<span class="hour">' + h + '</span>';

			//}

			calendar += '</div>';
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
				calendar += ('<div class="other-month calendar-cell"><div class="cell-span-container" style="position:relative;"><span class="day">' + (prev_days - firstDay + j + 1) + '</span><div class="addNewEvent-cellIcon dark-icon">+</div></div></div>');

			} else if (j >= firstDay + getDaysInMonth(month, year)) {
				i = i + 1;
				calendar += ('<div class="other-month calendar-cell"><div class="cell-span-container" style="position:relative;"><span class="day">' + i + '</span><div class="addNewEvent-cellIcon dark-icon">+</div></div></div>');

			} else {

				calendar += ('<div class="current-month  calendar-cell day' + (j - firstDay + 1) + '" data-bind="click: $root.moveToDetailsPageOnCalendarCellClick"><div class="cell-span-container" style="position:relative;"><span class="day">' + (j - firstDay + 1) + '</span><div class="addNewEvent-cellIcon light-icon" >+</div></div></div>');

			}

			if (j % 7 == 6) calendar += ('</div>');
		}

		calendar += ('</div>');

		el.html(calendar);

		el.find('.day' + today).css({ "border": "3px outset rgb(185, 185, 185)", "color": "rgb(167, 238, 211)", "font-size": "1.7em", "font-weight": "bold" }).addClass("today-cell").find("span").css("top", "50px");

	}

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
