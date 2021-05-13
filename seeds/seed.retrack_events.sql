INSERT INTO retrack_events (event_name, event_type, relevant_date, event_owner_id)
VALUES
    ('Past Date Game', 'Game', '2020-01-13', '1'),
    ('Current Date Movie', 'Movie', now(), '1' ),
    ('No Date Other default time', 'Other', DEFAULT, '1'),
    ('Future Date No-type', DEFAULT, '2022-01-13', '1');