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
KKEventDateModel.prototype.displayInfo = function ()
{
	function dateDiffInDays( a, b )
	{
		var _MS_PER_DAY = 1000 * 60 * 60 * 24;
		// Discard the time and time-zone information.
		var utc1 = Date.UTC( a.getFullYear(), a.getMonth(), a.getDate() );
		var utc2 = Date.UTC( b.getFullYear(), b.getMonth(), b.getDate() );

		return Math.floor(( utc2 - utc1 ) / _MS_PER_DAY );
	}
	var daysDiff = dateDiffInDays( new Date(), this.javaScriptStartDate );

	if ( daysDiff === 0 ) return "dzisiaj";
	else if ( daysDiff === 1 ) return "jutro";
	else if ( daysDiff === 2 ) return "pojutrze";
	else if ( daysDiff > 2 ) return "za " + daysDiff + " dni";
	else if ( daysDiff === -1 ) return "wczoraj";
	else if ( daysDiff === -2 ) return "przedwczoraj";
	else return (-daysDiff) + " dni temu";
}