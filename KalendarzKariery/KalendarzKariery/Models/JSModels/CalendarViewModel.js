
function CalendarViewModel() {
	var self = this;

	self.event = {
		name: "",
		adress: "",
		startTime: "",
		endTime: ""
	};

	self.events = ko.observableArray([

	]);

	self.addEvent = function () {

		self.events.push(self.event);
		AddToCalendar();

		function AddToCalendar() {
			if (event.target) target = event.target;
			else if (event.srcElement) target = event.srcElement;

			var dayNumber = $("#hiddenDay").attr("name");

			var cellDay = ".day" + dayNumber;

			var $object = $(cellDay);

			var cellLineStart = ".cell-line" + $("#startHourTxtBox").val();
			var cellLineEnd = ".cell-line" + $("#endHourTxtBox").val();

			var leftOffset = $object.find(cellLineStart).css("left");

			var startWidth = $object.find(cellLineStart).offset().left;
			var endWidth = $object.find(cellLineEnd).offset().left;
			var width = endWidth - startWidth;

			$("#add-new-event-container").hide();

			var $event = $('<div class="event-rectangle" style="left:' + leftOffset + '; width:' + width + 'px;"><input type=hidden name=' + self.event.name + ' adress=' + self.event.adress + ' startHour=' + self.event.startTime + ' endHour=' + self.event.endTime + ' ></input></div>');

			$object.append($event);
			$event.fadeIn();
		};
	}

}

ko.applyBindings(new CalendarViewModel());