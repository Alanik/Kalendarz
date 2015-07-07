var KKEventDateModelObservable = function ( javaScriptStartDate, startMinute, endMinute, startHour, endHour, day, month, year )
{
	var self = this;

	//month value starts from 0 - 11
	self.javaScriptStartDate = javaScriptStartDate;
	self.startMinute = ko.observable( startMinute );
	self.endMinute = ko.observable( endMinute );
	self.startHour = ko.observable( startHour );
	self.endHour = ko.observable( endHour );
	self.day = ko.observable( day );
	//month value starts from 1 - 12
	self.month = ko.observable( month + 1 );
	self.year = ko.observable( year );
}

KKEventDateModel.prototype.formatZero = function ( time )
{
	return time < 10 ? '0' + time : time;
}
KKEventDateModel.prototype.displayFullDate = function ()
{
	return this.day + '.' + this.formatZero( this.month ) + '.' + this.year;
}
KKEventDateModel.prototype.displayFullTime = function ()
{
	return this.formatZero( this.startHour ) + ':' + this.formatZero( this.startMinute ) + " - " + this.formatZero( this.endHour ) + ':' + this.formatZero( this.endMinute );
}