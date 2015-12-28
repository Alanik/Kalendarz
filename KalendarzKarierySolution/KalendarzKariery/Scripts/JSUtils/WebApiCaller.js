var WebApiCaller = function (){
	var self = this;
	
	//Event

	self.callAddEvent = function ( data )
	{
	  return $.ajax( {
			url: "/api/Events/AddEvent",
			dataType: "JSON",
			type: "POST",
			data: data
		} );
	};

	self.callUpdateEvent = function ( data )
	{
		return $.ajax( {
			url: "/api/Events/UpdateEvent",
			dataType: "JSON",
			type: "PUT",
			data: data
		} );
	};

	self.callDeleteEvent = function ( id )
	{
		return $.ajax( {
			url: "/api/Events/DeleteEvent/" + id,
			dataType: "JSON",
			type: "DELETE"
		} );
	}

	self.callAddExistingEventToUser = function ( data )
	{
		return $.ajax( {
			url: "/api/Events/AddExistingEventToUser",
			dataType: "JSON",
			type: "Post",
			data: data
		} );
	}

	self.callSignUpUserForEvent = function ( data )
	{
		return $.ajax( {
			url: "/api/Events/SignUpUserForEvent",
			dataType: "JSON",
			type: "Post",
			data: data
		} );
	}

	//Note

	self.callAddNote = function ( data ){	
		return $.ajax( {
			url: "/api/Notes/AddNote",
			dataType: "JSON",
			type: "POST",
			data: data
		} );
	}

	self.callDeleteNote = function ( id )
	{
		return $.ajax( {
			url: "/api/Notes/DeleteNote/" + id,
			dataType: "JSON",
			type: "DELETE"
		} );
	}

	self.callUpdateNote = function ( data ){
		return $.ajax( {
			url: "/api/Notes/UpdateNote",
			dataType: "JSON",
			type: "PUT",
			data: data
		} );
	}

	self.callSetLineThroughNote = function ( data ){
		return $.ajax( {
			url: "/api/Notes/UpdateNote",
			dataType: "JSON",
			type: "PUT",
			data: data
		} );

	};
}