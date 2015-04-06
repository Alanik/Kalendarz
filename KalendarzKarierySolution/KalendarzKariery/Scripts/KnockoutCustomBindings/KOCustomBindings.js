////////////////////////////////////
//custom ko binding to get the selected text from a selectbox html control
////////////////////////////////////
ko.bindingHandlers.selectedText = {
	init: function (element, valueAccessor) {
		var value = valueAccessor();
		//var value = valueAccessor;
		value($("option:selected", element).text());

		$(element).change(function () {
			value($("option:selected", this).text());
		});
	},
	update: function ( element, valueAccessor )
	{
		var value = ko.utils.unwrapObservable(valueAccessor());
		//var value = valueAccessor;
		$("option", element).filter(function (i, el) { return $(el).text() === value; }).prop("selected", "selected");
	}
};

ko.bindingHandlers.runOnlyOnce = {
	init: function ( element, valueAccessor, allBindings, viewModel, bindingContext )
	{
		// This will be called when the binding is first applied to an element
		// Set up any initial state, event handlers, etc. here
	},
	update: function ( element, valueAccessor, allBindings, viewModel, bindingContext )
	{
		// This will be called once when the binding is first applied to an element,
		// and again whenever any observables/computeds that are accessed change
		// Update the DOM element based on the supplied values here.
	}
};
