const path = require('path');
const express = require('express');
const xss = require('xss');
const TimelinesService = require('./timelines-service');

const timelineRouter = express.Router();
const jsonParser = express.json();

const serializeTimeline = timeline => ({
    timeline_id: timeline.timeline_id,
    timeline_name: xss(timeline.timeline_name),
    tl_owner_id: xss(timeline.tl_owner_id)
});

const serializeTimelineEvent = timelineEvent => ({
    timeline_id: timelineEvent.timeline_id,
    event_id: timelineEvent.event_id
});

timelineRouter
    .route('/')
    .get((req,res, next) => {
        const knexInstance = req.app.get('db');
        TimelinesService.getAllTimelines(knexInstance)
            .then( timelines => {
                res.json(timelines.map(serializeTimeline));
            })
            .catch(error => {
                next(error);
            });
    })
    .post(jsonParser, (req,res,next) => {
        const {timeline_name, tl_owner_id} = req.body;
        const newTimeline = {timeline_name, tl_owner_id}; 

        for( const [key,value] of Object.entries(newTimeline)) {
            if(value == null) {
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                });
            }
        }

        TimelinesService.insertTimeline(
            req.app.get('db'),
            newTimeline
        )
        .then(timeline => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${timeline.timeline_id}`))
                .json(serializeTimeline(timeline));
        })
        .catch(next);
    });

timelineRouter
    .route('/:timeline_id')
    .all((req,res,next) => {
        TimelinesService.getById(
            req.app.get('db'),
            req.params.timeline_id
        )
        .then( timeline => {
            if(!timeline) {
                return res.status(404).json({
                    error: {message: `Timeline doesn't exist`}
                });
            }
            res.timeline = timeline; 
            next();
        })
        .catch(next);
    })
    .get((req,res,next) => {
        res.json(res.timeline);
    })
    .delete((req,res,next) => {
        TimelinesService.deleteTimeline(
            req.app.get('db'),
            req.params.timeline_id
        )
        TimelinesService.deleteTimelineAllEvents(
            req.app.get('db'),
            req.params.timeline_id
        )
        .then( () => {
            res.status(204).end();
        })
        .catch(next);
    });

timelineRouter
    .route('/:timeline_id/timelineEvents')
    .get((req,res, next) => {
        const knexInstance = req.app.get('db');
        TimelinesService.getAllTimelineEvents(knexInstance)
            .then( timelineEvents => {
                res.json(timelineEvents);
            })
            .catch(error => {
                next(error);
            });
    })
    .post(jsonParser, (req, res, next) => {
        const {timeline_id, event_id} = req.body;
        const newTimelineEvent = {timeline_id, event_id};

        for( const [key,value] of Object.entries(newTimelineEvent)) {
            if(value == null) {
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                });
            }
        }

        TimelinesService.insertTimelineEvent(
            req.app.get('db'),
            newTimelineEvent
        )
        .then( timelineEvent => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${timelineEvent.event_id}`))
                .json(serializeTimelineEvent(timelineEvent));
        })
        .catch(next);
    })

timelineRouter
    .route('/:timeline_id/timelineEvents/:event_id')
    .delete((req,res,next) => {
        TimelinesService.deleteTimelineEvent(
            req.app.get('db'),
            req.params.timeline_id,
            req.params.event_id
        )
        .then( () => {
            res.status(204).end();
        })
        .catch(next);
    });

module.exports = timelineRouter;