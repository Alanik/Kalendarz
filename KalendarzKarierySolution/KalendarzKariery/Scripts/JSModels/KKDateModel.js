var KKDateModel = function ( javaScriptDate, minute, hour, day, month, year ){
	var self = this;

	self.javaScriptDate = javaScriptDate;
	self.minute = minute;
	self.hour = hour;
	self.day = day;
	self.month = month;
	self.year = year;
}

KKDateModel.prototype.formatZero = function ( time ){
	return time < 10 ? '0' + time : time;
}
KKDateModel.prototype.displayFullDate = function (){
	return this.formatZero( this.day ) + '/' + this.formatZero( this.month ) + '/' + this.year;
}
KKDateModel.prototype.displayFullTime = function (){
	return this.formatZero( this.hour ) + ':' + this.formatZero( this.minute );
}