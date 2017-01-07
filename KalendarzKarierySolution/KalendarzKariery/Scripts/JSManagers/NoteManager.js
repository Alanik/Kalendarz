var NoteManager = function ( appViewModel )
{
	var self = this;

	self.getNewKKNoteModel = function ( id, data, addedBy, privacyLevelName, privacyLevelValue, displayDate, isLineThrough, dateAdded)
	{
		var kkNote = new KKNoteModel();
		var date = new Date();

		kkNote.id = id;
		kkNote.data = data;
		kkNote.addedBy = addedBy;
		kkNote.privacyLevel.name = privacyLevelName;
		kkNote.privacyLevel.value = privacyLevelValue;
		kkNote.isLineThrough = ko.observable( isLineThrough );

		if ( dateAdded instanceof KKDateModel )
		{
			kkNote.dateAdded = dateAdded;
		}
		else
		{
			kkNote.dateAdded = new KKDateModel( dateAdded.minute, dateAdded.hour, dateAdded.day, dateAdded.month, dateAdded.year );
		}

		date = new Date( displayDate.year, displayDate.month - 1, displayDate.day, 0, 0, 0, 0 );
		kkNote.displayDate = new KKDateModel( date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getFullYear() );

		return kkNote;
	}

	self.getNotesForGivenDay = function ( year, month, day )
	{
		var yearProp = appViewModel.myNoteTree[year], monthProp, daysProp;
		if ( yearProp )
		{
			monthProp = yearProp[month];
			if ( monthProp )
			{
				var daysProp = monthProp[day];
				if ( daysProp )
				{
					return daysProp;
				}
			}
		}

		return [];
	};

	self.getNoteByDateAndId = function ( id, year, month, day )
	{
		var yearProp = appViewModel.myNoteTree[year], monthProp, daysProp, note;
		if ( yearProp )
		{
			monthProp = yearProp[month];
			if ( monthProp )
			{
				for ( var i in monthProp )
				{
					daysProp = monthProp[i];
					for ( var j in daysProp )
					{
						note = daysProp[j];

						if ( note.id == id )
						{
							return note;
						}
					}
				}
			}
		}

		return null;
	}

	self.addNote = function (newKKNote)
	{
		var note, didAddNote = false;

		var year = newKKNote.displayDate.year;
		var month = newKKNote.displayDate.month;
		var day = newKKNote.displayDate.day;

		var noteTreeYearProp = appViewModel.myNoteTree[year] ? appViewModel.myNoteTree[year] : appViewModel.myNoteTree[year] = {};
		var noteTreeMonthProp = noteTreeYearProp[month] ? noteTreeYearProp[month] : noteTreeYearProp[month] = {};
		var dayNotesArr = noteTreeMonthProp[day] ? noteTreeMonthProp[day] : noteTreeMonthProp[day] = [];

		//1. add note to noteTree 
		dayNotesArr.splice( 0, 0, newKKNote );

		//2. add note to detailsPage.dayPlanPart.dayPlanVM.notes
		appViewModel.detailsPage.dayPlanPart.dayPlanVM.notes( dayNotesArr );
	}

	self.removeNote = function ( id, year, month, day )
	{
		var noteTree = appViewModel.myNoteTree;
		var noteTreeYearProp, noteTreeMonthProp, dailyNotes, note;

		if ( noteTree[year] )
		{
			noteTreeYearProp = noteTree[year];
			if ( noteTreeYearProp[month] )
			{
				noteTreeMonthProp = noteTreeYearProp[month];
				if ( noteTreeMonthProp[day] )
				{
					dailyNotes = noteTreeMonthProp[day];

					for ( var i = 0; i < dailyNotes.length; i++ )
					{
						note = dailyNotes[i];

						if ( note.id === id )
						{
							//1. remove note from noteTree
							dailyNotes.splice( i, 1 );

							if ( !dailyNotes.length )
							{
								//if array node that contains daily notes is empty then remove the node from noteTree
								delete noteTreeMonthProp[day];
							}

							return;
						}
					}
				}
			}
		}

	};


}