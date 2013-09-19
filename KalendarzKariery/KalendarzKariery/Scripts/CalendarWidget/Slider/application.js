
location.hash = '#0';

$(document).ready(function () {
	
	$('#slides').superslides({
		slide_easing: 'easeInOutCubic',
		slide_speed: 600,
		pagination: true,
		hashchange: true,
		scrollable: true
	});

});
