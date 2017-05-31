var WebApiCaller = function ()
{
	var self = this;

	self.requestPromise = function ( url, type, data )
	{
		return $.ajax( {
			url: url,
			dataType: "JSON",
			type: type,
			data: data
		} );
	}

	self.interceptResponse = function (data, response, callback)
	{
		var size = response.getResponseHeader( 'Content-Length' );
		var output = '<div>request size: <b>' + humanize( data.RequestContentLength ) + '</b></div><div>response size: <b>' + humanize( size ) + '</b></div>'

		callback(output);

		function humanize( size )
		{
			var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
			var ord = Math.floor( Math.log( size ) / Math.log( 1024 ) );
			ord = Math.min( Math.max( 0, ord ), units.length - 1 );
			var s = Math.round(( size / Math.pow( 1024, ord ) ) * 100 ) / 100;
			return s + ' ' + units[ord];
		}
	}

	/////////////////////////////////////////////////////////////////////
	//Event
	/////////////////////////////////////////////////////////////////////

	self.callAddEvent = function ( data )
	{
		var url = '/api/Events/AddEvent';

		return self.requestPromise(url, "POST", data);
	};

	self.callUpdateEvent = function ( data )
	{
		var url = '/api/Events/UpdateEvent';

		return self.requestPromise( url, "PUT", data );
	};

	self.callDeleteEvent = function ( id )
	{
		var url = '/api/Events/DeleteEvent/' + id;

		return self.requestPromise( url, "DELETE");
	}

	self.callAddExistingEventToUser = function ( data )
	{
		var url = '/api/Events/AddExistingEventToUser';

		return self.requestPromise( url, "POST", data);
	}

	self.callSignUpUserForEvent = function ( data )
	{
		var url = '/api/Events/SignUpUserForEvent';

		return self.requestPromise( url, "POST", data );
	}

	///////////////////////////////////////////////////////////
	//Notes
	///////////////////////////////////////////////////////////

	self.callAddNote = function ( data )
	{
		var url = '/api/Notes/AddNote';

		return self.requestPromise( url, "POST", data );
	}

	self.callDeleteNote = function ( id )
	{
		var url = '/api/Notes/DeleteNote/' + id;

		return self.requestPromise( url, "DELETE");
	}

	self.callUpdateNote = function ( data )
	{
		var url = '/api/Notes/UpdateNote';

		return self.requestPromise( url, "PUT", data );
	}
}