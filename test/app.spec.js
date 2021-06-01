const knex = require('knex');
const fixtures = require('./retrack-fixtures');
const app = require('../src/app');

describe('App', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, world!');
  });
});

describe('Retrack Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy() );

  // before('cleanup', () => db('retrack_events_timelines_bridge','retrack_timelines','retrack_events').truncate() );
  before('cleanup raw', () => db.raw('TRUNCATE TABLE retrack_events_timelines_bridge, retrack_timelines, retrack_events CASCADE') );
  
  // afterEach('cleanup', () => db('retrack_events_timelines_bridge','retrack_timelines','retrack_events').truncate() );
  afterEach('cleanup raw', () => db.raw('TRUNCATE TABLE retrack_events_timelines_bridge, retrack_timelines, retrack_events CASCADE') );


  describe('GET /events', () => {
    context('Given no events', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/events')
          .expect(200, []);
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = fixtures.makeEventsArray();

      beforeEach('insert events', () => {
        return db
          .into('retrack_events')
          .insert(testEvents);
      })

      it('gets the events', () => {
        return supertest(app)
          .get('/events')
          .expect(200, testEvents);
      })
    })
  });

describe('POST /events', () => {
  it('adds a new event to the database', () => {
    const newEvent = {
      "event_name": "Dummy Insert",
      "event_type": "Movie",
      "relevant_date": "2021-06-28",
      "event_owner_id": "1"
    };

    return supertest(app)
      .post('/events')
      .send(newEvent)
      .expect(201)
      .expect( res => {
        expect(res.body.event_name).to.eql(newEvent.event_name)
        expect(res.body.event_type).to.eql(newEvent.event_type)
        expect(res.body.relevant_date).to.eql(newEvent.relevant_date)
        expect(res.body.event_owner_id).to.eql(newEvent.event_owner_id)
        expect(res.body).to.have.property('event_id')
      })
      .then(res =>
        supertest(app)
          .get(`/events/${res.body.event_id}`)
          .expect(res.body)
      );
  })
});

  describe('GET /events/:event_id', () => {
    context('Given no events', () => {
      it('responds with 404 and an empty list', () => {
        return supertest(app)
          .get('/events/10')
          .expect(404, {
            error: {message: 'Event not found'}
          });
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = fixtures.makeEventsArray();

      beforeEach('insert events', () => {
        return db
          .into('retrack_events')
          .insert(testEvents);
      })

      it('gets the event', () => {
        return supertest(app)
          .get('/events/10')
          .expect(200, testEvents[0]);
      })
    })
  });
  // DELETE /events/:event_id====NOT ADDED YET====

  describe('GET /timelines', () => {
    context('Given no timelines', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/timelines')
          .expect(200, []);
      })
    })

    context('Given there are timelines in the database', () => {
      const testTimelines = fixtures.makeTimelinesArray();

      beforeEach('insert timelines', () => {
        return db
          .into('retrack_timelines')
          .insert(testTimelines);
      })

      it('gets the timelines', () => {
        return supertest(app)
          .get('/timelines')
          .expect(200, testTimelines);
      })
    })
  });
  // POST /timelines
  describe('POST /timelines', () => {
    it('adds a new timeline to the database', () => {
      const newTimeline = {
        "timeline_name": "Dummy TL 11",
        "tl_owner_id": "117404874156041511981"
      };
  
      return supertest(app)
        .post('/timelines')
        .send(newTimeline)
        .expect(201)
        .expect( res => {
          expect(res.body.timeline_name).to.eql(newTimeline.timeline_name)
          expect(res.body.tl_owner_id).to.eql(newTimeline.tl_owner_id)
          expect(res.body).to.have.property('timeline_id')
        })
    })
  });

  // GET /timelines/:timeline_id is not used
  describe('GET /timelines/:timeline_id/timelineEvents', () => {

    context('Given there are timelines in the database', () => {
      const testTimelines = fixtures.makeTimelinesArray();
      const testEvents = fixtures.makeEventsArray();
      const testTimelineEvents = fixtures.makeTimelineEventsArray();
      const testResults = fixtures.makeTimelineEventsArrayResults();  

      beforeEach('insert events', () => {
        return db
          .into('retrack_events')
          .insert(testEvents);
      })

      beforeEach('insert timelines', () => {
        return db
          .into('retrack_timelines')
          .insert(testTimelines);
      })

      beforeEach('insert timelineEvents', () => {
        return db
          .into('retrack_events_timelines_bridge')
          .insert(testTimelineEvents);
      })

      it('gets the timeline', () => {
        return supertest(app)
          .get('/timelines/11/timelineEvents')
          .expect(200, testResults);
      })
    })
  });
  // DELETE /timelines/:timeline_id====NOT ADDED YET====

  // POST /timelines/:timeline_id/timelineEvents
  describe('POST /timelines/:timeline_id/timelineEvents', () => {

    const testTimelines = fixtures.makeTimelinesArray();
    const testEvents = fixtures.makeEventsArray();
    beforeEach('insert events', () => {
      return db
        .into('retrack_events')
        .insert(testEvents);
    })

    beforeEach('insert timelines', () => {
      return db
        .into('retrack_timelines')
        .insert(testTimelines);
    })

    it('adds a new timelineEvent to the database', () => {
      const newTimelineEvent = {
        "timeline_id": 11,
        "event_id": 10,
      };
  
      return supertest(app)
        .post('/timelines/1/timelineEvents')
        .send(newTimelineEvent)
        .expect(201)
        .expect( res => {
          expect(res.body.timeline_id).to.eql(newTimelineEvent.timeline_id)
          expect(res.body.event_id).to.eql(newTimelineEvent.event_id)
        })
    })
  });
  // DELETE /timelines/:timeline_id/timelineEvents/:event_id====NOT ADDED YET====
  
});