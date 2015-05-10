var KKDateModel = function ( javaScriptDate, minute, hour, day, month, year ){
	var self = this;

	//month is from 0 - 11
	self.javaScriptDate = javaScriptDate;
	self.minute = minute;
	self.hour = hour;
	self.day = day;
	//month is from 1 - 12
	self.month = month + 1;
	self.year = year;
}

KKDateModel.prototype.formatZero = function ( time ){
	return time < 10 ? '0' + time : time;
}
KKDateModel.prototype.displayFullDate = function (){
	return  this.day + '.' + this.formatZero( this.month ) + '.' + this.year;
}
KKDateModel.prototype.displayFullTime = function (){
	return this.formatZero( this.hour ) + ':' + this.formatZero( this.minute );
}