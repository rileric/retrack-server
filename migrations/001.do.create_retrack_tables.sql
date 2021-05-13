CREATE TYPE event_category AS ENUM (
    'Movie',
    'Game',
    'Book',
    'Comic',
    'Other'
);

CREATE TABLE retrack_events (
    event_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    event_name TEXT NOT NULL,
    event_type event_category DEFAULT 'Other' NOT NULL,
    relevant_date DATE DEFAULT NULL,
    event_owner_id TEXT DEFAULT '1'
);

CREATE TABLE retrack_timelines (
    timeline_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    timeline_name TEXT NOT NULL,
    tl_owner_id TEXT DEFAULT '1'
);

CREATE TABLE retrack_events_timelines_bridge (
    timeline_id INTEGER REFERENCES retrack_timelines(timeline_id),
    event_id INTEGER REFERENCES retrack_events(event_id),
    PRIMARY KEY (timeline_id, event_id)
);