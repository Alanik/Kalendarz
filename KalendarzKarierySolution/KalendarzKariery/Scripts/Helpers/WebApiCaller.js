var WebApiCaller = function (appViewModel){
	var self = this;
	self.appViewModel = appViewModel;
	
	//event

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
				alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				self.appViewModel.hideLoader();
				$addEventContainer.show();
			}
		} );
	};

	self.callUpdateEvent = function ( data, callback )
	{
		var $addEventContainer = $( "#addNewEventContainer" );

		$.ajax( {
			url: "/api/Events",
			dataType: "JSON",
			type: "PUT",
			data: data,
			beforeSend: function ()
			{
				self.appViewModel.showLoader( $addEventContainer.closest( ".main-section" ).siblings( ".dotted-page-overlay" ) );
				$addEventContainer.hide();
			},
			success: function ( result )
			{
				callback( result, self.appViewModel );
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				self.appViewModel.hideLoader();
				$addEventContainer.show();
			}
		} );
	};

	self.callDeleteEvent = function ( id, element, callback )
	{
		var $loader = $( "#details" ).siblings( ".dotted-page-overlay" );

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
				alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				self.appViewModel.hideLoader( $loader );
				self.appViewModel.hideConfirmationPopupBox( element );
			}
		} );
	}

	self.callAddExistingEventToUser = function ( data, callback )
	{
		var $loader = $( "#lobby" ).siblings( ".dotted-page-overlay" );

		$.ajax( {
			url: "/api/Events/AddExistingEventToUser/" + data,
			dataType: "JSON",
			type: "Put",
			beforeSend: function () { self.appViewModel.showLoader( $loader ); },
			data: data,
			success: function ( result )
			{
				callback( result, self.appViewModel, $loader );
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				self.appViewModel.hideLoader( $loader );
				self.appViewModel.hideConfirmationPopupBox( element );
			}
		} );
	}

	//Note

	self.callAddNote = function (data, callback ){
		var $loader = $( "#details" ).siblings( ".dotted-page-overlay" );

		$.ajax( {
			url: "/api/Notes/",
			dataType: "JSON",
			type: "POST",
			beforeSend: function () { self.appViewModel.showLoader( $loader ); },
			data: data,
			success: function ( result )
			{
				callback( result, self.appViewModel, $loader );
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				self.appViewModel.hideLoader( $loader );
			}
		} );
	}

	self.callDeleteNote = function ( id, element, callback )
	{
		var $loader = $( "#details" ).siblings( ".dotted-page-overlay" );

		$.ajax( {
			url: "/api/Notes/" + id,
			dataType: "JSON",
			type: "DELETE",
			beforeSend: function () { self.appViewModel.hideConfirmationPopupBox( element ); self.appViewModel.showLoader( $loader ); },
			data: id,
			success: function ( result )
			{
				callback( result, $loader, self.appViewModel );
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				self.appViewModel.hideLoader( $loader );
				self.appViewModel.hideConfirmationPopupBox( element );
			}
		} );
	}

	self.callUpdateNote = function ( data, callback, $container, note, text ){
		var $loader = $( "#details" ).siblings( ".dotted-page-overlay" );

		$.ajax( {
			url: "/api/Notes/",
			dataType: "JSON",
			type: "PUT",
			beforeSend: function () { self.appViewModel.showLoader( $loader ); },
			data: data,
			success: function ( result )
			{
				callback( result, self.appViewModel, $loader, $container, note, text );
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				self.appViewModel.hideLoader( $loader );
			}
		} );
	}

	self.callSetLineThroughNote = function ( data, callback, $container, note ){
		var $loader = $( "#details" ).siblings( ".dotted-page-overlay" );

		$.ajax( {
			url: "/api/Notes/",
			dataType: "JSON",
			type: "PUT",
			beforeSend: function () { self.appViewModel.showLoader( $loader ); },
			data: data,
			success: function ( result )
			{
				callback( result, self.appViewModel, $loader, $container, note);
			},
			error: function ()
			{
				alert( "Wystąpił nieoczekiwany błąd. Prosze spróbować jeszcze raz." );
				self.appViewModel.hideLoader( $loader );
			}
		} );

	};
}