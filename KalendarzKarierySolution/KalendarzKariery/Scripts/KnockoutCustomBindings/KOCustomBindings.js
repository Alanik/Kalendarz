////////////////////////////////////
//custom ko binding to get the selected text from a selectbox html control
////////////////////////////////////
ko.bindingHandlers.selectedText = {
	init: function ( element, valueAccessor )
	{
		var value = valueAccessor();
		//var value = valueAccessor;
		value( $( "option:selected", element ).text() );

		$( element ).change( function ()
		{
			value( $( "option:selected", this ).text() );
		} );
	},
	update: function ( element, valueAccessor )
	{
		var value = ko.utils.unwrapObservable( valueAccessor() );
		//var value = valueAccessor;
		$( "option", element ).filter( function ( i, el ) { return $( el ).text() === value; } ).prop( "selected", "selected" );
	}
};

( function (){
	var $container, haveInitialized, newNodes = [], itemClass, masonryOptions;

	function afterAdd( node, index, item )
	{
		if ( node.nodeType !== 1 )
		{
			return; // This isn't an element node, nevermind
		}
		newNodes.push( node );
	}

	ko.bindingHandlers.masonry = {
		defaultItemClass: 'grid-item',
		// Wrap value accessor with options to the template binding,
		// which implements the foreach logic
		makeTemplateValueAccessor: function ( valueAccessor )
		{
			return function ()
			{
				var modelValue = valueAccessor(),
                    options,
                    unwrappedValue = ko.utils.peekObservable( modelValue );    // Unwrap without setting a dependency here

				options = {
					afterAdd: afterAdd
				};

				// If unwrappedValue.data is the array, preserve all relevant
				// options and unwrap value so we get updates
				ko.utils.unwrapObservable( modelValue );
				ko.utils.extend( options, {
					'foreach': unwrappedValue.data,
					'as': unwrappedValue.as,
					'includeDestroyed': unwrappedValue.includeDestroyed,
					'templateEngine': ko.nativeTemplateEngine.instance
				} );
				return options;
			};
		},
		'init': function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext )
		{
			itemClass = ko.bindingHandlers.masonry.defaultItemClass;
			masonryOptions = {};
			haveInitialized = false;
			$container = $( element );

			var parameters = ko.utils.unwrapObservable( valueAccessor() );
			if ( parameters && typeof parameters == 'object' && !( 'length' in parameters ) )
			{
				if ( parameters.masonryOptions )
				{
					var clientOptions;
					if ( typeof parameters.masonryOptions === 'function' )
					{
						clientOptions = parameters.masonryOptions();
						if ( typeof clientOptions !== 'object' )
						{
							throw new Error( 'masonryOptions callback must return object' );
						}
					} else if ( typeof parameters.masonryOptions !== 'object' )
					{
						throw new Error( 'masonryOptions must be an object or function' );
					} else
					{
						clientOptions = parameters.masonryOptions;
					}
					ko.utils.extend( masonryOptions, clientOptions );
				}
				if ( parameters.itemClass )
				{
					itemClass = parameters.itemClass;
				}
			}

			// Initialize template engine, moving child template element to an
			// "anonymous template" associated with the element
			ko.bindingHandlers.template.init(
                element,
                ko.bindingHandlers.masonry.makeTemplateValueAccessor( valueAccessor )
            );

			return { controlsDescendantBindings: true };
		},
		'update': function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext )
		{
			ko.bindingHandlers.template.update( element,
                    ko.bindingHandlers.masonry.makeTemplateValueAccessor( valueAccessor ),
                    allBindingsAccessor, viewModel, bindingContext );

			// Make this function depend on the view model, so it gets called for updates
			var data = ko.bindingHandlers.masonry.makeTemplateValueAccessor(
                        valueAccessor )().foreach;
			ko.utils.unwrapObservable( data );

			if ( !haveInitialized )
			{
				masonryOptions.itemSelector = '.' + itemClass;
				$container.masonry( masonryOptions );
			}
			else
			{
				var newElements = $( newNodes );
				$container.masonry( 'appended', newElements );
				$container.masonry( 'layout' );
				newNodes.splice( 0, newNodes.length ); // reset back to empty
			}

			// Update gets called upon initial rendering as well
			haveInitialized = true;
			return { controlsDescendantBindings: true };
		}
	};
} )();
