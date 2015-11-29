var KKEventDateModel = function ( startMinute, endMinute, startHour, endHour, day, month, year )
{
	var self = this;

	self.startMinute = startMinute;
	self.endMinute = endMinute
	self.startHour = startHour;
	self.endHour = endHour;
	self.day = day;
	//month value starts from 1 - 12
	self.month = month;
	self.year = year;
	self.javaScriptStartDate = new Date( year, month - 1, day, startHour, startMinute, 0, 0 );
	self.javaScriptEndDate = new Date( year, month - 1, day, endHour, endMinute, 0, 0 );
}

KKEventDateModel.prototype.formatZero = function ( time ){
	return time < 10 ? '0' + time : time;
}
KKEventDateModel.prototype.displayFullDate = function (){
	return  this.day + '.' + this.formatZero( this.month ) + '.' + this.year;
}
KKEventDateModel.prototype.displayFullTime = function (){
	return this.formatZero( this.startHour ) + ':' + this.formatZero( this.startMinute ) + " - " + this.formatZero( this.endHour ) + ':' + this.formatZero( this.endMinute );
}