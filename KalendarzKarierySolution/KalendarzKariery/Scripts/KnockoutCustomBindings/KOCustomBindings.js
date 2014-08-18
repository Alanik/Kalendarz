////////////////////////////////////
//custom ko binding to get the selected text from a selectbox html control
////////////////////////////////////
ko.bindingHandlers.selectedText = {
	init: function (element, valueAccessor) {
		var value = valueAccessor();
		value($("option:selected", element).text());

		$(element).change(function () {
			value($("option:selected", this).text());
		});
	},
	update: function (element, valueAccessor) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		$("option", element).filter(function (i, el) { return $(el).text() === value; }).prop("selected", "selected");
	}
};
////////////////////////////////////