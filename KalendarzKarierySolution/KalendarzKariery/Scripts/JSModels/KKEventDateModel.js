var KKEventDateModel = function ( javaScriptStartDate, startMinute, endMinute, startHour, endHour, day, month, year )
{
	var self = this;

	self.javaScriptStartDate = javaScriptStartDate;
	self.startMinute = startMinute;
	self.endMinute = endMinute
	self.startHour = startHour;
	self.endHour = endHour;
	self.day = day;
	self.month = month;
	self.year = year;
}

KKEventDateModel.prototype.formatZero = function ( time ){
	return time < 10 ? '0' + time : time;
}
KKEventDateModel.prototype.displayFullDate = function (){
	return this.formatZero( this.day ) + '/' + this.formatZero( this.month ) + '/' + this.year;
}
KKEventDateModel.prototype.displayFullTime = function (){
	return this.formatZero( this.startHour ) + ':' + this.formatZero( this.startMinute ) + " - " + this.formatZero( this.endHour ) + ':' + this.formatZero( this.endMinute );
}