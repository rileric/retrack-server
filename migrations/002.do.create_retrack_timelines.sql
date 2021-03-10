CREATE TABLE retrack_timelines (
    timeline_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    timeline_name TEXT NOT NULL,
    event_id INTEGER
        REFERENCES retrack_events(event_id) NOT NULL
);