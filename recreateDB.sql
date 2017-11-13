drop table users;
drop table results;
drop table wagers;
drop table picks;
drop table games;

CREATE TABLE users (
  user_name VARCHAR(40) PRIMARY KEY,
  user_pass VARCHAR(40),
  email_address VARCHAR(40)
);

CREATE TABLE results (
  wager_id integer PRIMARY KEY,
  credits_changed INTEGER
);

CREATE TABLE picks (
  pick_id SERIAL PRIMARY KEY,
  wager_id INTEGER NOT NULL,
  pick_type VARCHAR(12),
  pick_team VARCHAR(40),
  pick_number NUMERIC,
  pick_number_qualifier VARCHAR(12),
  week_number INTEGER,
  game_id INTEGER
);

CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  game_status VARCHAR(10),
  game_time  TIMESTAMP WITH TIME ZONE,
  week_number INTEGER,
  team_one VARCHAR(20),
  team_two VARCHAR(20),
  team_one_score INTEGER,
  team_two_score INTEGER
);

CREATE TABLE wagers (
  wager_id SERIAL PRIMARY KEY,
  user_name VARCHAR(40),
  wager_amount INTEGER,
  pick_type VARCHAR(12),
  wager_status VARCHAR(10) --pending,loser,winner,push
)