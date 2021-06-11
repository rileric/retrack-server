const EventsService = {

    getAllEvents(knex) {
        return knex
            .select('*')
            .from('retrack_events')
            .orderBy('relevant_date', 'asc');
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