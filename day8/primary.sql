C:\Windows\system32>cd C:\Program Files\PostgreSQL\17\bin

C:\Program Files\PostgreSQL\17\bin>pg_ctl -D C:\Users\DELL\Documents\Testing_Postgre_Servers\Primary -o "-p 5433" -l C:/Users/DELL/Documents/Testing_Postgre_Servers/Primary/logfile start
waiting for server to start.... done
server started

C:\Program Files\PostgreSQL\17\bin>psql -p 5433 -d postgres
psql (17.4)
postgres=# select * from pg_stat_replicat   ion;
  pid  | usesysid |  usename   | application_name | client_addr | client_hostname | client_port |          backend_start           | backend_xmin |   state   | sent_lsn  | write_lsn | flush_lsn | replay_lsn | write_lag | flush_lag | replay_lag | sync_priority | sync_state |            reply_time
-------+----------+------------+------------------+-------------+-----------------+-------------+----------------------------------+--------------+-----------+-----------+-----------+-----------+------------+-----------+-----------+------------+---------------+------------+----------------------------------
 16520 |    16388 | replicator | walreceiver      | 127.0.0.1   |                 |       49855 | 2025-05-14 17:45:51.835796+05:30 |              | streaming | 0/5000168 | 0/5000168 | 0/5000168 | 0/5000168  |           |           |            |             0 | async      | 2025-05-14 17:48:02.522348+05:30
(1 row)


postgres=# select * from rental_log;
 log_id |        rental_time         | customer_id | film_id | amount |         logged_on
--------+----------------------------+-------------+---------+--------+----------------------------
      1 | 2025-05-14 16:51:48.860029 |           1 |     100 |   4.99 | 2025-05-14 16:51:48.860029
(1 row)


postgres=# create table rental_log_update_log(
postgres(#     log_id serial primary key,
postgres(#     field_name text,
postgres(#     old_value text,
postgres(#     new_value text,
postgres(#     logged_date timestamp default current_timestamp
postgres(# );
CREATE TABLE
postgres=# create or replace function Update_update_log()
postgres-# returns trigger as $$
postgres$# begin
postgres$#     if old.rental_time is distinct from new.rental_time then
postgres$#         insert into rental_log_update_log (field_name, old_value, new_value)
postgres$#         values ('rental_time', old.rental_time::TEXT, new.rental_time::TEXT);
postgres$#     end if;
postgres$#     if old.customer_id is distinct from new.customer_id then
postgres$#         insert into rental_log_update_log (field_name, old_value, new_value)
postgres$#         values ('customer_id', old.customer_id::TEXT, new.customer_id::TEXT);
postgres$#     end if;
postgres$#     if old.film_id is distinct from new.film_id then
postgres$#         insert into rental_log_update_log (field_name, old_value, new_value)
postgres$#         values ('film_id', OLD.film_id::TEXT, NEW.film_id::TEXT);
postgres$#     end if;
postgres$#     if OLD.amount is distinct from new.amount then
postgres$#         insert into rental_log_update_log (field_name, old_value, new_value)
postgres$#         values ('amount', old.amount::TEXT, new.amount::TEXT);
postgres$#     end if;
postgres$#     return new;
postgres$# end;
postgres$# $$ language plpgsql;
CREATE FUNCTION
postgres=# create trigger trg_log_rental_update
postgres-# before update on rental_log
postgres-# for each row
postgres-# execute function Update_update_log();
CREATE TRIGGER
postgres=# update rental_log set amount = 5 where customer_id = 1;
UPDATE 1
postgres=#