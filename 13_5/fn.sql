
--1) Try two concurrent updates to same row → see lock in action.
--transaction A
begin;
update accounts set balance =balance +100
where id=1;
commit;

--transaction B
begin;
update accounts set balance =balance -100
where id=1;
commit;
select * from accounts;


--2) Write a query using SELECT...FOR UPDATE and check how it locks row.

--transaction A
begin;
select * from customers 
where customer_id = 1 
for update;

--transaction B
begin;
update customers
set balance = balance - 100
where customer_id = 1;


--3) Intentionally create a deadlock and observe PostgreSQL cancel one transaction
--transaction A
begin;
update products set price =100 where id =1;--locks row 1


--transaction B
begin;
update products set price=600 where id =2; --locks row 2

--transaction A
update products set price=500 where id=2; -- tries to locks row 2(already locked by transaction B)

--transaction B-0
update products set price =600 where id =1;--tries to locks row 1(already locked by transaction A)


--4)4. Use pg_locks query to monitor active locks.
select * from pg_locks join pg_stat_activity on pg_lock.pid=pg_stat_activity.pid where not pg_locks.granted