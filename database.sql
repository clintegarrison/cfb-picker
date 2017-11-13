CREATE TABLE users (
  user_name VARCHAR(40) PRIMARY KEY,
  user_pass VARCHAR(40),
  email_address VARCHAR(40)
)
insert into users values ('ClintG', 'password', 'me@there.com')
select * from users
drop table users

CREATE TABLE results (
  wager_id PRIMARY KEY,
  credits_changed INTEGER
)
select * from results

-- GOAL: get all results for a single user
SELECT SUM(r.credits_changed) FROM results r, wagers w WHERE r.wager_id = w.wager_id AND w.user_nanem = ?
-- ^^ this should work, but going to have to promise.all for each user.. need to create query that will get'em all in one go

drop table wagers
CREATE TABLE wagers (
  wager_id SERIAL PRIMARY KEY,
  user_name VARCHAR(40),
  wager_amount INTEGER,
  pick_type VARCHAR(12),
  wager_status VARCHAR(10) --pending,loser,winner,push
)
select * from wagers
insert into wagers(user_name,wager_amount,wager_status) values('ClintG',220,'pending')

--parly = create wager.. loop and check/create games.. pomise all.. THEN loop and create picks.. promise all.. DONE

drop table picks
CREATE TABLE picks (
  pick_id SERIAL PRIMARY KEY,
  wager_id INTEGER NOT NULL,
  pick_type VARCHAR(12),
  pick_team VARCHAR(40),
  pick_number NUMERIC,
  pick_number_qualifier VARCHAR(12),
  week_number INTEGER,
  game_id INTEGER
)
INSERT INTO picks (wager_id, pick_type, pick_team, pick_number, pick_number_qualifier, week_number, game_id)

insert into picks(user_name,pick_type,pick_type,wager_amount,pick_team,pick_number,pick_number_qualifer,week_number)
values ('ClintG','totals',220,'Alabama',48,'OVER',5,9)

select * from picks

drop table games
CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  game_status VARCHAR(10),
  game_time  TIMESTAMP WITH TIME ZONE,
  week_number INTEGER,
  team_one VARCHAR(20),
  team_two VARCHAR(20),
  team_one_score INTEGER,
  team_two_score INTEGER
)

select * from games
SELECT * FROM games WHERE game_time IS NULL AND team_one='bama' AND team_two='auburn'
insert into games(game_status,team_one,team_two,team_one_score,team_two_score)
values (9,'Final','Alabama','Auburn',42,17)
-- generate the game ID in this table first.. THEN associate with the pick

-- how to associate


select * from picks where pick_number = -21

SELECT game_id,game_status,game_time,week_number,team_one,team_two,team_one_score,team_two_score FROM games WHERE game_status='TBD' AND week_number=1
