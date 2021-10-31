var id = "kirya522@gmail.com"; // CHANGE - id of the secondary calendar to pull events from
var DAYS_TO_SYNC = 30; // Number of days to sync
var SYNC_MARKER = "SYNCED FROM " + id; // Description to synced events, used as marker
var SYNC_EVENT_NAME = 'Booked' // Event name in work calendar

// Allow deletion of changed events
var ENABLE_DELETION = true
// Clean all synced items
var CLEAN_MODE = false;
function sync() {
    var currentDate = new Date();
    var endDate = new Date(currentDate.getTime() + DAYS_TO_SYNC * 24 * 60 * 60 * 1000); // millisecons

    var personalCalendar = CalendarApp.getCalendarById(id);
    var personalEvents = personalCalendar.getEvents(currentDate, endDate);

    var workCalendar = CalendarApp.getDefaultCalendar();
    var workEvents = workCalendar.getEvents(currentDate, endDate);

    if (!CLEAN_MODE) {
        // Syncing logic
        personalEvents.forEach(personalEvent => {

            var thereAreSimilarEvents = workEvents.some(workEvent => {
                return areEventsSimilar(workEvent, personalEvent)
            });

            if (!thereAreSimilarEvents && !personalEvent.isAllDayEvent()) {
                console.log("Adding event " + personalEvent.getTitle() + " " + personalEvent.getStartTime().toString())
                var newEvent = workCalendar.createEvent(SYNC_EVENT_NAME, personalEvent.getStartTime(), personalEvent.getEndTime());
                newEvent.setColor('5'); //Yellow
                newEvent.setDescription(SYNC_MARKER);
                newEvent.removeAllReminders();
            }
        })


        if (ENABLE_DELETION) {
            // Remove synced events that rescheduled
            workEvents.forEach(workEvent => {
                if (isEventSynced(workEvent)) {
                    var thereAreSimilarEvents = personalEvents.some(personalEvent => {
                        return areEventsSimilar(workEvent, personalEvent)
                    });

                    if (!thereAreSimilarEvents) {
                        console.info("Removing event " + workEvent.getStartTime().toString() + workEvent.getEndTime().toString())
                        workEvent.deleteEvent()
                    }
                }
            })
        }
    } else {
        workEvents.forEach(workEvent => {
            if (isEventSynced(workEvent)) {
                console.info("Removing event " + workEvent.getStartTime().toString() + workEvent.getStartTime().toString())
                workEvent.deleteEvent()
            }
        })
    }

}

function areEventsSimilar(workEvent, personalEvent) {
    var areEventsSimilar = false;
    if ((workEvent.getStartTime().getTime() == personalEvent.getStartTime().getTime()) && isEventSynced(workEvent) && (workEvent.getEndTime().getTime() == personalEvent.getEndTime().getTime())) {
        areEventsSimilar = true;
    }
    return areEventsSimilar;
}

function isEventSynced(event) {
  return (event.getTitle() === SYNC_EVENT_NAME) || (event.getDescription() === SYNC_MARKER)
}
