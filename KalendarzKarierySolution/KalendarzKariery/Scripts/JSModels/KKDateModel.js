var KKDateModel = function ( minute, hour, day, month, year )
{
	var self = this;

	self.minute = minute;
	self.hour = hour;
	self.day = day;
	//month is from 1 - 12
	self.month = month;
	self.year = year;
	self.javaScriptDate = new Date( year, month - 1, day, hour, minute, 0, 0 );
}

KKDateModel.prototype.formatZero = function ( time )
{
	return time < 10 ? '0' + time : time;
}
KKDateModel.prototype.displayFullDate = function ()
{
	return this.formatZero( this.day ) + '.' + this.formatZero( this.month ) + '.' + this.year;
}
KKDateModel.prototype.displayFullDate_EnlargeDay = function ()
{
	return ( '<span class="enlarged-font">' + this.formatZero( this.day ) + '</span>' + '.' + this.formatZero( this.month ) + '.' + this.year );
}
KKDateModel.prototype.displayFullTime = function ()
{
	return this.formatZero( this.hour ) + ':' + this.formatZero( this.minute );
}
