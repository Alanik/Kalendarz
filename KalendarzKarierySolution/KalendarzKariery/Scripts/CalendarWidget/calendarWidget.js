﻿( function ( $ )
{
	function calendarWidget( $placeholder, params )
	{
		"use strict";

		var currentMonthPrefix, weekDayClass, currentWeekdayClass, counter;
		var days, firstDay, prev_m, next_m, prev_days;
		var weekdayModulo, currentDay, dayPlusOne, dayCounter = 0;

		var now = new Date();
		var today = now.getDate();
		var weekday = now.getDay();
		var thismonth = now.getMonth();
		var thisyear = now.getFullYear();

		var opts = {
			// month must be from 0 - 11
			month: thismonth,
			year: thisyear,
			dayNames: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
			shortDayNames: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
			monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
		};

		$.extend( opts, params );

		var calendar = '';

		// START weekday-container
		calendar += ( '<div class="weekday-container">' );
		for ( var d = 0; d < 7; d++ )
		{
			if ( d == 6 )
			{
				weekDayClass = 'weekday-sunday'
				currentWeekdayClass = ( weekday === 0 ? 'current-weekday' : '' );
			}
			else
			{
				weekDayClass = 'weekday';
				currentWeekdayClass = ( weekday - 1 === d ? 'current-weekday' : '' );
			}

			calendar += '<div class="' + weekDayClass + ' ' + currentWeekdayClass + '"><div class="sm-hide">' + opts.dayNames[d] + '</div><div class="sm-show rg-hide">' + opts.shortDayNames[d] + '</div></div>';
		}
		calendar += '</div>';
		// END weekday-container

		//// START calendar-hours
		//for (var d = 0; d < 7; d++) {
		//  calendar += '<div class="calendar-hours sm-hide">';
		//  counter = 0;
		//  for (var i = 7; i < 22; i += 2) {
		//    calendar += '<div class="hour" style="left:' + ((counter + .4) * 6.4) + '%;"> ' + i + ' </div>';
		//    counter += 2;
		//  }
		//  calendar += '</div>';
		//}
		//// END calendar-hours

		// START calendar
		days = getDaysInMonth( opts.month, opts.year );
		firstDay = new Date( opts.year, opts.month, 1 ).getDay();
		firstDay = ( firstDay == 0 ) ? 6 : firstDay - 1;
		prev_m = opts.month == 0 ? 11 : opts.month - 1;
		next_m = opts.month == 11 ? 0 : opts.month + 1;
		prev_days = getDaysInMonth( prev_m, prev_m == 11 ? opts.year - 1 : opts.year );

		weekdayModulo;
		currentDay;
		dayPlusOne;
		dayCounter = 0;

		for ( d = 0; d < 42; d++ )
		{
			weekdayModulo = d % 7;
			dayPlusOne = d + 1;

			if ( weekdayModulo == 0 )
			{
				calendar += '<div class="calendar-row">';
			}

			// previous month
			if ( d < firstDay )
			{
				currentDay = ( prev_days - firstDay + dayPlusOne );
				calendar += ( '<div class="other-month-cell other-month-day' + currentDay + ' prev-month-cell calendar-cell"  data-daynumber="' + ( prev_days - firstDay + dayPlusOne ) + '" data-weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }">' );
				calendar += ( '<div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + ( prev_days - firstDay + dayPlusOne ) + '</span>' );
				if ( dayPlusOne == firstDay )
				{
					calendar += ( '<span class="cell-month-name-span" style="margin-left:20px;">' + opts.monthNames[prev_m] + '</span>' );
				}
				calendar += ( '<div class="addNewEvent-cellIcon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}"><i class="mdi mdi-plus md-icon-hover"></i></div></div></div></div>' );

				// next month
			} else if ( d >= firstDay + days )
			{
				dayCounter = dayCounter + 1;
				calendar += ( '<div class="other-month-cell other-month-day' + dayCounter + ' next-month-cell calendar-cell" data-daynumber="' + dayCounter + '" data-weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }">' );
				calendar += ( '<div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + dayCounter + '</span>' );
				if ( d == ( firstDay + days ) )
				{
					calendar += ( '<span class="cell-month-name-span" style="margin-left:10px;">' + opts.monthNames[next_m] + '</span>' );
				}
				calendar += ( ' <div class="addNewEvent-cellIcon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}"><i class="mdi mdi-plus md-icon-hover"></i></div></div></div></div>' );

				// current month
			} else
			{
				currentDay = ( d - firstDay + 1 );

				calendar += ( '<div class="current-month-cell calendar-cell day' + currentDay + '" data-daynumber="' + currentDay + '" data-weekday="' + weekdayModulo + '" data-bind="click:function(){ $root.moveToDetailsPageOnCalendarCellClick($element) }">' );
				calendar += ( '<div class="calendar-cell-placeholder"><div class="cell-span-container"><span class="day">' + currentDay + '</span>' );
				if ( currentDay == 1 )
				{
					calendar += ( '<span class="cell-month-name-span" style="margin-left:10px;">' + opts.monthNames[opts.month] + '</span>' );
				}
				calendar += ( '<div class="addNewEvent-cellIcon" data-bind="click:function(data, e){ $root.showAddPrivateCalendarEventPopupOnClick($element, data, e)}"><i class="mdi mdi-plus md-icon-hover"></i></div></div></div></div>' );
			}

			if ( d % 7 == 6 )
			{
				calendar += ( '</div>' );
			}
		}

		calendar += ( '</div>' );
		// END calendar

		$placeholder.append( calendar );

		// draw lines
		$placeholder.find( '.calendar-cell' ).each( function ( index )
		{
			var $placeholder = $( this ).find( ".calendar-cell-placeholder" );
			var cellLines = '';
			for ( var i = 0.3; i < 15; i++ )
			{
				var left = i * 6.8;
				cellLines += '<div style="left:' + left + '%;" class="cell-line' + ( parseInt( i, 10 ) + 7 ) + ' cell-line-style"></div>'
			}

			$placeholder.append( cellLines );
		} );

		// add today-cell class to today's calendar cell
		if ( opts.year == thisyear && opts.month == thismonth )
		{
			$placeholder.find( '.day' + today ).addClass( "today-cell" );
		}

		function getDaysInMonth( month, year )
		{
			var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			if ( ( month == 1 ) && ( year % 4 == 0 ) && ( ( year % 100 != 0 ) || ( year % 400 == 0 ) ) )
			{
				return 29;
			} else
			{
				return daysInMonth[month];
			}
		}
	};

	// jQuery plugin initialization
	$.fn.calendarWidget = function ( params )
	{
		//var t0 = performance.now();
		calendarWidget( this, params );
		//var t1 = performance.now();

		//console.log("calendar widget generated in: " + (t1 - t0));
		return this;
	};

} )( jQuery );
