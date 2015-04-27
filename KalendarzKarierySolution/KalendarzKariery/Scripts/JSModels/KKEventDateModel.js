var KKEventDateModel = function ( javaScriptStartDate, startMinute, endMinute, startHour, endHour, day, month, year )
{
	var self = this;

	//month value starts from 0 - 11
	self.javaScriptStartDate = javaScriptStartDate;
	self.startMinute = startMinute;
	self.endMinute = endMinute
	self.startHour = startHour;
	self.endHour = endHour;
	self.day = day;
	//month value starts from 1 - 12
	self.month = month + 1;
	self.year = year;
}

KKEventDateModel.prototype.formatZero = function ( time ){
	return time < 10 ? '0' + time : time;
}
KKEventDateModel.prototype.displayFullDate = function (){
	return  this.day + '/' + this.formatZero( this.month ) + '/' + this.year;
}
KKEventDateModel.prototype.displayFullTime = function (){
	return this.formatZero( this.startHour ) + ':' + this.formatZero( this.startMinute ) + " - " + this.formatZero( this.endHour ) + ':' + this.formatZero( this.endMinute );
}