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

select * from games where game_status != 'FINAL'
delete from games where week_number=3 and team_one='Georgia Tech'
delete from games where week_number=7 and team_one='South Florida'
update games set team_one_score=35, team_two_score=14, game_status='FINAL' where week_number=10 and team_one='Michigan'
update games set team_one_score=39, team_two_score=50, game_status='FINAL' where week_number=10 and team_one='West Virginia'
update games set team_one_score=48, team_two_score=17, game_status='FINAL' where week_number=10 and team_one='Southern Cal'


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


SELECT g.week_number,g.team_one, g.team_one_score, g.team_two, g.team_two_score, w.wager_amount, w.user_name, p.pick_type, p.pick_team, p.pick_number, p.pick_number_qualifier FROM games g, wagers w, picks p WHERE p.wager_id = w.wager_id AND p.game_id = g.game_id AND w.wager_status='TBD'AND g.game_status='FINAL'
SELECT 
        g.team_one, 
        g.team_one_score, 
        g.team_two,
        g.team_two_score,
        w.wager_amount,
        w.user_name,
        p.pick_type,
        p.pick_team,
        p.pick_number,
        p.pick_number_qualifier
FROM
        games g,
        wagers w,
        picks p
WHERE
        p.wager_id = w.wager_id
        AND p.game_id = g.game_id
        AND w.wager_status='TBD'
        AND g.game_status='FINAL'
        
        update picks p set 
        
        select * from picks where pick_team='BYU'
        
        update picks set pick_number=-17 where pick_team='BYU' and week_number=5
        
        select * from picks p , wagers w where p.wager_id=w.wager_id and p.pick_number is null
        
        83
85
560

select * from wagers w, picks p, games g where p.wager_id=w.wager_id and p.game_id=g.game_id and w.wager_id in (83,85,560)

update picks set pick_number=3.5 where pick_team='Mississippi' and week_number=9
update picks set pick_number=3.5 where pick_team='Texas AM' and pick_type='spread' and week_number=9
delete from picks where pick_team='South Florida' and week_number=7

select * from games where game_id=677

select * from picks where pick_team='BYU' and week_number=5