var WebApiCaller = function (appViewModel){
	var self = this;
	self.appViewModel = appViewModel;
	
	self.callAddEvent = function ( data, callback ){
		var $addEventContainer = $( "#addNewEventContainer" );

		$.ajax( {
			url: "/api/Events",
			dataType: "JSON",
			type: "POST",
			data: data,
			beforeSend: function ()
			{
				self.appViewModel.showLoader( $addEventContainer.closest( ".main-section" ).siblings( ".dotted-page-overlay" ) );
				$addEventContainer.hide();
			},
			success: function ( result )
			{
				callback( result, self.appViewModel);
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz." );
				self.appViewModel.hideLoader();
				$addEventContainer.show();
			}
		} );
	};

	self.callDeleteEvent = function ( id, element, callback )
	{
		var $loader = $( "#details" ).siblings( ".dotted-page-overlay" );
		var events;

		$.ajax( {
			url: "/api/Events/" + id,
			dataType: "JSON",
			type: "DELETE",
			beforeSend: function () { self.appViewModel.hideConfirmationPopupBox( element ); self.appViewModel.showLoader( $loader ); },
			data: id,
			success: function ( result )
			{
				callback(result, $loader, self.appViewModel);
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze sprobować jeszcze raz." );
				self.appViewModel.hideLoader( $loader );
				self.appViewModel.hideConfirmationPopupBox( element );
			}
		} );
	}
}