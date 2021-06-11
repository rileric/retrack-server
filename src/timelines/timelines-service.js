const timelinesTable = 'retrack_timelines';
const bridgeTable = 'retrack_events_timelines_bridge';
const eventsTable = 'retrack_events';

const TimelinesService = {

    getAllTimelines(knex) {
        return knex
            .select('*')
            .from(`${timelinesTable}`);
    },

    insertTimeline(knex, newTimeline) {
        return knex
            .insert(newTimeline)
            .into(`${timelinesTable}`)
            .returning('*')
            .then( rows => {
                return rows[0];
            });
    },

    getById(knex, timeline_id) {
        return knex
            .from(`${bridgeTable}`)
            .innerJoin(`${eventsTable}`, `${bridgeTable}.event_id`, `${eventsTable}.event_id`)
            .where({timeline_id});
    },

    deleteTimeline(knex, timeline_id) {
        return knex
            .from(`${timelinesTable}`)
            .where({timeline_id})
            .delete();
    },

    getAllTimelineEvents(knex) {
        return knex
            .from(`${bridgeTable}`)
            .innerJoin(`${eventsTable}`, `${bridgeTable}.event_id`, `${eventsTable}.event_id`)
            .orderBy('relevant_date', 'asc');

    },

    insertTimelineEvent(knex, newTimelineEvent) {
        return knex
            .insert(newTimelineEvent)
            .into(`${bridgeTable}`)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    deleteTimelineEvent(knex, timeline_id, event_id) {
        return knex
            .from(`${bridgeTable}`)
            .where({
                timeline_id: timeline_id,
                event_id: event_id
            })
            .delete();
    },

    deleteTimelineAllEvents(knex, timeline_id) {
        return knex
            .from(`${bridgeTable}`)
            .where({
                timeline_id: timeline_id,
            })
            .delete();
    },

    deleteAllTimelineEventsWithEvent(knex, event_id) {
        return knex
            .from(`${bridgeTable}`)
            .where({
                event_id: event_id,
            })
            .delete();
    }
};

module.exports = TimelinesService;