var WebApiCaller = function (calendarViewModel){
	var self = this;
	self.calendarViewModel = calendarViewModel;
	
	self.callAddEvent = function ( url, data, callback ){
		var $addEventContainer = $( "#addNewEventContainer" );

		$.ajax( {
			url: url,
			dataType: "JSON",
			type: "POST",
			data: data,
			beforeSend: function ()
			{
				self.calendarViewModel.showLoader( $addEventContainer.closest( ".main-section" ).siblings( ".dotted-page-overlay" ) );
				$addEventContainer.hide();
			},
			success: function ( result )
			{
				callback( result, self.calendarViewModel);
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz." );
				self.calendarViewModel.hideLoader();
				$addEventContainer.show();
			}
		} );
	};


	self.deleteEvent = function (){

	}
}