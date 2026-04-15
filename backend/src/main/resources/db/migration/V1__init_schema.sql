create table game (
    id uuid not null,
    name varchar(120) not null,
    result_type varchar(32) not null,
    constraint pk_game primary key (id),
    constraint ck_game_result_type check (result_type in ('NO_SCORE', 'HIGHEST_SCORE', 'LOWEST_SCORE'))
);

create table player (
    id uuid not null,
    name varchar(120) not null,
    constraint pk_player primary key (id)
);

create table game_session (
    id uuid not null,
    game_id uuid not null,
    played_at timestamp with time zone not null,
    constraint pk_game_session primary key (id),
    constraint fk_game_session_game foreign key (game_id) references game (id)
);

create table session_player_result (
    id uuid not null,
    game_session_id uuid not null,
    player_id uuid not null,
    score integer,
    rank integer,
    is_winner boolean not null,
    constraint pk_session_player_result primary key (id),
    constraint uk_session_player_result_session_player unique (game_session_id, player_id),
    constraint fk_session_player_result_game_session foreign key (game_session_id) references game_session (id),
    constraint fk_session_player_result_player foreign key (player_id) references player (id)
);

create unique index uk_game_name_ci_trim on game (lower(btrim(name)));
create unique index uk_player_name_ci_trim on player (lower(btrim(name)));

create index idx_game_session_game_id on game_session (game_id);
create index idx_session_player_result_player_id on session_player_result (player_id);
