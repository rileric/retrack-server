const EventsService = {

    getAllEvents(knex) {
        let test = knex.select('*').from('retrack_events');
        return test;
    },

    insertEvent(knex, newEvent) {
        return knex
            .insert(newEvent)
            .into('retrack_events')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    getById(knex, event_id) {
        return knex
            .from('retrack_events')
            .select('*')
            .where({event_id})
            .first();
    },

    deleteEvent(knex, event_id) {
        return knex
            .from('retrack_events')
            .where({event_id})
            .delete();
    },
};

module.exports = EventsService;