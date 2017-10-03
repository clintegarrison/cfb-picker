CREATE TABLE users (
  user_name VARCHAR(40) PRIMARY KEY,
  user_pass VARCHAR(40),
  email_address VARCHAR(40)
)
insert into users values ('ClintG', 'password', 'me@there.com')
select * from users
drop table users

CREATE TABLE credits (
  user_name VARCHAR(40) PRIMARY KEY,
  credits INTEGER
)
select * from credits

CREATE TABLE wagers (
  wager_id SERIAL PRIMARY KEY,
  user_name VARCHAR(40),
  wager_amount INTEGER,
  wager_status VARCHAR(10) --pending,loser,winner,push
)
select * from wagers
insert into wagers(user_name,wager_amount,wager_status) values('ClintG',220,'pending')

CREATE TABLE picks (
  pick_id SERIAL PRIMARY KEY,
  wager_id INTEGER NOT NULL,
  pick_type VARCHAR(12),
  pick_team VARCHAR(40),
  pick_number INTEGER,
  pick_number_qualifer VARCHAR(12),
  week_number INTEGER,
  game_id INTEGER
)

insert into picks(user_name,pick_type,pick_type,wager_amount,pick_team,pick_number,pick_number_qualifer,week_number) 
values ('ClintG','totals',220,'Alabama',48,'OVER',5,9)

select * from picks
drop table picks

CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  game_status VARCHAR(10),
  game_time  TIMESTAMP WITH TIME ZONE,
  team_one VARCHAR(20),
  team_two VARCHAR(20),
  team_one_score INTEGER,
  team_two_score INTEGER
)
select * from games

insert into games(game_status,team_one,team_two,team_one_score,team_two_score) 
values (9,'Final','Alabama','Auburn',42,17)
-- generate the game ID in this table first.. THEN associate with the pick

-- how to associate