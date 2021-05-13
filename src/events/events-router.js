const path = require('path');
const express = require('express');
const xss = require('xss');
const EventsService = require('./events-service');

const eventRouter = express.Router();
const jsonParser = express.json();

const serializeEvent = event => ({
    event_id: event.event_id,
    event_name: xss(event.event_name),
    event_type: event.event_type,
    relevant_date: event.relevant_date,
    event_owner_id: event.event_owner_id
});

eventRouter
    .route('/')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        EventsService.getAllEvents(knexInstance)
            .then(events => {
                res.json(events.map(serializeEvent));
            })
            .catch(error => {
                next(error);
            })
    })
    .post(jsonParser, (req,res,next) => {
        const {event_id, event_name, event_type, relevant_date, event_owner_id} = req.body;
        const newEvent = {event_id, event_name, event_type, relevant_date, event_owner_id};

        for( const [key,value] of Object.entries(newEvent)) {
            if(!key === 'relevant_date') {
                if(value == null) {
                    return res.status(400).json({
                        error: {message: `Missing '${key}' in request body`}
                    })
                }
            }
        }

        EventsService.insertEvent(
                req.app.get('db'),
                newEvent
            )
            .then(event => {
                res.status(201)
                .location(path.posix.join(req.originalUrl, `/${event.event_id}`))
                .json(serializeEvent(event));
            })
            .catch(next);
    });

eventRouter
    .route('/:event_id')
    .all((req,res,next) => {
        EventsService.getById(
            req.app.get('db'),
            req.params.event_id
        )
        .then(event => {
            if(!event) {
                return res.status(404).json({
                    error: {message: `Event doesn't exist`}
                });
            }
            res.event = event; 
            next();
        })
        .catch(next);
    })

    .get((req,res,next) => {
        res.json(serializeEvent(res.event));
    })

    .delete((req,res,next) => {
        EventsService.deleteEvent(
            req.app.get('db'),
            req.params.event_id
        )
        .then( () => {
            res.status(204).end();
        })
        .catch(next);
    });

module.exports = eventRouter;
