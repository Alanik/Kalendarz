var NotificationUtil = function ( $parent )
{
	var self = this, $container = $( '<div id="appNotificationContainer"></div>' ), Notification;
	$parent.append( $container );

	Notification = function ()
	{
		var _message, _content, _$parent = $container, _clicked = false, _active = false, _$notification = $( '<div class="app-notification"><div class="app-notification-message"></div><div class="app-notification-content"></div><div class="app-notification-close">X</div></div>' );

		this.getMessage = function () { return _message };
		this.setMessage = function ( message ) { _message = message; _$notification.children( '.app-notification-message' ).html( this._message ); }
		this.getContent = function () { return _content; }
		this.setContent = function ( content ) { _content = content; _$notification.children( '.app-notification-content' ).html( this._content ); }
		this.loading = function ( message, content )
		{
			initialize( 'app-notification-loading', message, content );
		};
		this.success = function ( message, content )
		{
			initialize( 'app-notification-success', message, content );
		};
		this.error = function ( message, content )
		{
			initialize( 'app-notification-error', message, content );
		};
		this.warning = function ( message, content )
		{
			initialize( 'app-notification-warning', message, content );
		}

		setUpClickHandlers();

		function show()
		{
			_$parent.append( _$notification );
			_$notification.show();
			_appended = true;
			setTimeout( function ()
			{
				if ( !_clicked )
				{
					hide();
				}

			}, 8000 );
		}
		function hide()
		{
			_$notification.hide( "slow", function () { _$notification.remove() } );
		}
		function resetClasses()
		{
			_$notification.removeClass( 'app-notification-loading' );
			_$notification.removeClass( 'app-notification-success' );
			_$notification.removeClass( 'app-notification-error' );
			_$notification.removeClass( 'app-notification-warning' );
		}
		function setUpClickHandlers()
		{
			_$notification.click( function ( e )
			{
				if ( e.target.className === 'app-notification-close' )
				{
					hide();
					return;
				}

				_clicked = true;
			} )
		}
		function initialize( className, message, content )
		{
			this._message = message;
			this._content = content;

			resetClasses();
			_$notification.addClass( className );

			if ( message )
			{
				_$notification.children( '.app-notification-message' ).html( this._message );
			}
			if ( content )
			{
				_$notification.children( '.app-notification-content' ).html( this._content );
			}
			if ( !_active )
			{
				show();
			}
		}
	}

	self.newNotification = function ()
	{
		return new Notification();
	}
}