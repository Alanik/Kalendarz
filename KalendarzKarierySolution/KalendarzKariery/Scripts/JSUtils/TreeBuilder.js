var TreeBuilder = function (appViewModel) {
  var self = this;

  //Events

  self.buildEventTree = function (yearEventTreeModel, isPublicEventTree) {
    var eventTree = {}, groups;
    var dayGroup, day, dayGroupLength, event, kkEvent, address, minutes, startDate;
    var year, yearProp, eventTreeYearProp, eventTreeMonthProp, eventTreeDayGroupProp, eventTreeEventsProp;
    var nowDate = appViewModel.todayDate.javaScriptDate;

    for (var y = 0; y < yearEventTreeModel.length; y++) {
      yearProp = yearEventTreeModel[y];
      year = yearProp.year
      eventTreeYearProp = eventTree[year] ? eventTree[year] : eventTree[year] = {};

      for (var k = 0; k < yearProp.eventsGroupedByMonth.length; k++) {

        eventTreeMonthProp = eventTreeYearProp[yearProp.eventsGroupedByMonth[k].month] = {};
        groups = yearProp.eventsGroupedByMonth[k].eventsGroupedByDay;

        //event day groups
        for (var i = 0; i < groups.length; i++) {
          dayGroup = groups[i];
          day = dayGroup.day;

          dayGroupLength = dayGroup.events.length;
          eventTreeDayGroupProp = eventTreeMonthProp[day] = [];

          // events in the day group
          for (var j = 0; j < dayGroupLength; j++) {
            event = dayGroup.events[j];

            address = getAddress(event);
            minutes = getMinutes(event);
            startDate = getStartDate(event);

            kkEvent = appViewModel.EVENT_MANAGER.getNewKKEventModel(event.addedBy, address.street, address.city, address.zipCode, event.description, event.details, minutes, event.kind.value, event.kind.name, event.id, event.occupancyLimit, event.privacyLevel.name, event.privacyLevel.value, startDate, event.name, event.urlLink, event.price, event.dateAdded, event.isEventAddedToCurrentUserCalendar, event.isCurrentUserSignedUpForEvent, event.status);

            eventTreeDayGroupProp.push(kkEvent);

            if (isPublicEventTree) {
              //push public event to appViewModel.publicEvents
              appViewModel.publicEvents.push(kkEvent);
            }
          }

          appViewModel.setCalendarPlacementRow(eventTreeDayGroupProp);
        }

        eventTreeYearProp[yearProp.eventsGroupedByMonth[k].month] = eventTreeMonthProp;
      }
    }

    function getStartDate(event) {
      //TODO: create KKEventModel from the event returned from the server (don't use new Date call - unnecessary)

      ////////////////////////////////////////////////////////////////
      //in javascript months start from 0 to 11 so we need to adjust it
      event.startDate.month = event.startDate.month - 1;
      ////////////////////////////////////////////////////////////////

      var sdate = new Date(event.startDate.year, event.startDate.month, event.startDate.day, event.startDate.hour, event.startDate.minute, 0, 0);
      var edate;

      if (event.endDate) {
        ////////////////////////////////////////////////////////////////
        //in javascript months start from 0 to 11 so we need to adjust it
        event.endDate.month = event.endDate.month - 1;
        ////////////////////////////////////////////////////////////////

        edate = new Date(event.endDate.year, event.endDate.month, event.endDate.day, event.endDate.hour, event.endDate.minute, 0, 0);
        return new KKEventDateModel(sdate.getMinutes(), edate.getMinutes(), sdate.getHours(), edate.getHours(), sdate.getDate(), sdate.getMonth() + 1, sdate.getFullYear());
      } else {
        return new KKEventDateModel(sdate.getMinutes(), null, sdate.getHours(), null, sdate.getDate(), sdate.getMonth(), sdate.getFullYear());
      }
    };
    function getAddress(event) {
      return {
        street: event.address.street,
        city: event.address.city,
        zipCode: event.address.zipCode
      }
    };
    function getMinutes(event) {

      if (event.endDate == null) {
        return 0;
      }

      var startH = event.startDate.hour;
      var startM = event.startDate.minute;
      var endH = event.endDate.hour;
      var endM = event.endDate.minute;

      var minutes = ((endH - startH) * 60) + (endM - startM);

      return minutes;
    }

    return eventTree;
  };

  self.buildEventTreeCountBasedOnEventKind = function (indexViewModelEventCountTree, defaultEventKinds) {
    var eventTree = {}, element, eventCountTreeElement;

    for (var i = 0; i < defaultEventKinds.length; i++) {
      element = eventTree[i + 1] = {};
      eventCountTreeElement = indexViewModelEventCountTree[i];

      if (eventCountTreeElement && eventCountTreeElement.value == (i + 1)) {
        element.upcoming = ko.observable(eventCountTreeElement.events.upcoming);
        element.old = ko.observable(eventCountTreeElement.events.old);
      } else {
        //events with given eventKind.value do not exist so we need to create an empty object

        element.upcoming = ko.observable(0);
        element.old = ko.observable(0);

        indexViewModelEventCountTree.splice(i, 0, element);
      }
    }

    return eventTree;
  };

  self.transformNews = function (eventsArray) {
    var event, events = [];

    for (var i = 0; i < eventsArray.length; i++) {
      event = eventsArray[i];
      setDateAdded(event);
      events.push(event);
    }

    return events;

    function setDateAdded(event) {
      var sdate = new Date(parseInt(event.dateAdded.substr(6)));
      event.dateAdded = new KKDateModel(sdate.getMinutes(), sdate.getHours(), sdate.getDate(), sdate.getMonth() + 1, sdate.getFullYear());
    }
  }

  self.transformPrivacyLevels = function (plArray) {
    var obj = {}, privacyLevel;

    for (var i = 0; i < plArray.length; i++) {
      privacyLevel = plArray[i];
      privacyLevel.name = privacyLevel.name.toLowerCase();

      obj[privacyLevel.name] = privacyLevel.value;
    }

    return obj;

  }

  //Notes

  self.buildNoteTree = function (yearNoteTreeModel) {
    var noteTree = {}, groups;
    var dayGroup, day, dayGroupLength, note, kkNote, dateAdded, displayDate;
    var year, yearProp, noteTreeYearProp, noteTreeMonthProp, noteTreeDayGroupProp, noteTreeNotesProp;

    for (var y = 0; y < yearNoteTreeModel.length; y++) {
      yearProp = yearNoteTreeModel[y];
      year = yearProp.year
      noteTreeYearProp = noteTree[year] ? noteTree[year] : noteTree[year] = {};

      for (var k = 0; k < yearProp.notesGroupedByMonth.length; k++) {
        noteTreeMonthProp = noteTreeYearProp[yearProp.notesGroupedByMonth[k].month] = {};
        groups = yearProp.notesGroupedByMonth[k].notesGroupedByDay;

        //note day groups
        for (var i = 0; i < groups.length; i++) {
          dayGroup = groups[i];
          day = dayGroup.day;

          dayGroupLength = dayGroup.notes.length;
          noteTreeDayGroupProp = noteTreeMonthProp[day] = [];

          // notes in the day group
          for (var j = 0; j < dayGroupLength; j++) {
            note = dayGroup.notes[j];

            kkNote = appViewModel.NOTE_MANAGER.getNewKKNoteModel(note.id, note.data, note.addedBy, note.privacyLevel.name, note.privacyLevel.value, note.displayDate, note.isLineThrough, note.dateAdded);

            noteTreeDayGroupProp.push(kkNote);
          }
        }

        noteTreeYearProp[yearProp.notesGroupedByMonth[k].month] = noteTreeMonthProp;
      }
    }

    return noteTree;
  }
};