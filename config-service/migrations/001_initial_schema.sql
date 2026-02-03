-- Initial schema for Config Service

CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(26) PRIMARY KEY, -- ULID
    name VARCHAR(256) UNIQUE NOT NULL,
    comments VARCHAR(1024)
);

CREATE TABLE IF NOT EXISTS configurations (
    id VARCHAR(26) PRIMARY KEY, -- ULID
    application_id VARCHAR(26) REFERENCES applications(id),
    name VARCHAR(256) NOT NULL,
    comments VARCHAR(1024),
    config JSONB NOT NULL,
    UNIQUE (application_id, name)
);
