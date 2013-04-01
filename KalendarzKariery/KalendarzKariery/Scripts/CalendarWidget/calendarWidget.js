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

		// next month
		//if (month == 11) {
		//    var next_month = '<a href="?month=' + 1 + '&amp;year=' + (year + 1) + '" title="' + monthNames[0] + ' ' + (year + 1) + '">' + monthNames[0] + ' ' + (year + 1) + '</a>';
		//} else {
		//    var next_month = '<a href="?month=' + (month + 2) + '&amp;year=' + (year) + '" title="' + monthNames[month + 1] + ' ' + (year) + '">' + monthNames[month + 1] + ' ' + (year) + '</a>';
		//}

		//// previous month
		//if (month == 0) {
		//    var prev_month = '<a href="?month=' + 12 + '&amp;year=' + (year - 1) + '" title="' + monthNames[11] + ' ' + (year - 1) + '">' + monthNames[11] + ' ' + (year - 1) + '</a>';
		//} else {
		//    var prev_month = '<a href="?month=' + (month) + '&amp;year=' + (year) + '" title="' + monthNames[month - 1] + ' ' + (year) + '">' + monthNames[month - 1] + ' ' + (year) + '</a>';
		//}

		calendar += ('<div id="current-month-header">' + '<span style="font-size:.7em;">' + dayNames[6 % today] + "</span>" + ", " + '<span>' + today + " "  + monthNames[month] + '</span>' + " " + '<span style="font-size:.7em;">' + year + '</span></div>');
		// uncomment the following lines if you'd like to display calendar month based on 'month' and 'view' paramaters from the URL
		//table += ('<div class="nav-prev">'+ prev_month +'</div>');
		//table += ('<div class="nav-next">'+ next_month +'</div>');
		calendar += ('<div class="weekday-container" ' + 'id="calendar-month' + i + ' ">');

		for (d = 0; d < 7; d++) {
			calendar += '<div class="weekday">' + dayNames[d] + '</div>';
		}

		calendar += '</div>';

		for (d = 0; d < 7; d++) {
			calendar += '<div class="calendar-hours">';

			for (var h = 7; h < 22; h+=2) {
			
				calendar += '<span class="hour">' + h +'</span>';
				
			}

			calendar += '</div>';
		}

		var days = getDaysInMonth(month, year);
		var firstDayDate = new Date(year, month, 1);
		var prev_days = getDaysInMonth(month, year);
		var firstDay = firstDayDate.getDay() - 1;

		var prev_m = month == 0 ? 11 : month - 1;
		var prev_y = prev_m == 11 ? year - 1 : year;
		var prev_days = getDaysInMonth(prev_m, prev_y);
		firstDay = (firstDay == 0 && firstDayDate) ? 7 : firstDay;

		var i = 0;


		for (j = 0; j < 42; j++) {

			if (j % 7 == 0) {

				calendar += '<div class="calendar-row">';
			}

			if ((j < firstDay)) {

				calendar += ('<div class="other-month calendar-cell"><div class="cell-span-container" style="position:relative;"><span class="day">' + (prev_days - firstDay + j + 1) + '</span></div></div>');

			} else if ((j >= firstDay + getDaysInMonth(month, year))) {

				i = i + 1;
				calendar += ('<div class="other-month calendar-cell"><div class="cell-span-container" style="position:relative;"><span class="day">' + i + '</span></div></div>');

			} else {

				calendar += ('<div class="current-month  calendar-cell day' + (j - firstDay + 1) + '"><div class="cell-span-container" style="position:relative;"><span class="day">' + (j - firstDay + 1) +'</span></div></div>');

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
