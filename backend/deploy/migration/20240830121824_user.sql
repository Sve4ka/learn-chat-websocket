-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS users
(
    id              SERIAL PRIMARY KEY,
    email           varchar UNIQUE,
    name            varchar,
    sur_name        varchar,
    hashed_password VARCHAR
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS users;
-- +goose StatementEnd
