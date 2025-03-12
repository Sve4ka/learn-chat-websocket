-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS chat
(
    id   serial primary key,
    name varchar
);

CREATE TABLE IF NOT EXISTS chat_user
(
    id_user int,
    id_chat int
);


CREATE TABLE IF NOT EXISTS messages
(
    id        serial primary key,
    id_chat   int,
    id_user   int,
    name_user varchar,
    text      varchar
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
drop table if exists chat, chat_user, messages;
-- +goose StatementEnd
