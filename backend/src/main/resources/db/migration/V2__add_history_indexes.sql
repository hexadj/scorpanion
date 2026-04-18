create index if not exists idx_game_session_played_at_id_desc
    on game_session (played_at desc, id desc);

create index if not exists idx_game_session_game_id_played_at_id_desc
    on game_session (game_id, played_at desc, id desc);

create index if not exists idx_session_player_result_player_id_game_session_id
    on session_player_result (player_id, game_session_id);
