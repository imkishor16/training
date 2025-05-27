DROP TABLE IF EXISTS Accounts;

CREATE TABLE Accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    balance INT,
    version INT DEFAULT 1
);

INSERT INTO Accounts (name, balance) VALUES
('Alice', 1000),
('Bob', 2000);

SELECT * FROM Accounts;
ABORT;

BEGIN;

UPDATE Accounts SET balance = balance - 500 WHERE name = 'Alice';
UPDATE Accounts SET balance = balance + 500 WHERE name = 'Bob';

-- Suppose something fails
-- ROLLBACK; --  this to cancel everything
COMMIT;

-------------------------------------------------------------------------------------
BEGIN;

UPDATE Accounts SET balance = balance - 100 WHERE name = 'Alice';
SAVEPOINT after_alice;

-- Typo in table name to simulate error
UPDATE Accountss SET balance = balance + 100 WHERE name = 'Bob';

ROLLBACK TO after_alice; -- Roll back only Bob's part

-- Try again correctly
UPDATE Accounts SET balance = balance + 100 WHERE name = 'Bob';
COMMIT;

---------------------------------------------------------------------------------------
-- Dirty Read
-- Reading data from an uncommitted transaction.
--session -1
BEGIN;
UPDATE Accounts SET balance = 0 WHERE id = 1;
--session -2 
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; -- Not supported in PostgreSQL but works in some DBs
BEGIN;
SELECT * FROM Accounts WHERE id = 1; -- Might see uncommitted data if DB supports dirty read

------------------------------------------------------------------------------------------

--Non-Repeatable Read
--A row value changes between two reads in the same transaction.
--session -1
BEGIN;
SELECT balance FROM Accounts WHERE id = 1; -- 1000
-- Wait...
SELECT balance FROM Accounts WHERE id = 1; -- 1500 (if updated by B)
COMMIT;

--session -2
UPDATE Accounts SET balance = 1500 WHERE id = 1;
COMMIT;

-------------------------------------------------------------------------------------------
-- Phantom Read
-- A new row appears between queries in the same transaction.
--session 1
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT * FROM Accounts WHERE balance > 1000; -- Assume 1 row
-- Wait...
SELECT * FROM Accounts WHERE balance > 1000; -- 2 rows?
COMMIT;

--session 2
INSERT INTO Accounts (name, balance) VALUES ('Charlie', 1500);
COMMIT;

-------------------------------------------------------------------------------------------
--Pessimistic Locking
-- Lock the data while reading to avoid conflict (e.g., SELECT ... FOR UPDATE).

BEGIN;
SELECT * FROM Accounts WHERE id = 1 FOR UPDATE;
-- Locks the row, no one else can write until COMMIT
UPDATE Accounts SET balance = balance + 100 WHERE id = 1;
COMMIT;

BEGIN;

UPDATE Accounts SET balance = balance - 100 WHERE id = 1;
COMMIT


-------------------------------------------------------------------------------------------
--Optimistic Locking
--Use a version or timestamp to check if data changed before updating.
-- First read
SELECT * FROM Accounts WHERE id = 1; -- version = 1

-- Attempt update
UPDATE Accounts
SET balance = 1200, version = version + 1
WHERE id = 1 AND version = 1;
-- If someone else updated, version != 1, update fails

-------------------------------------------------------------------------------------------
--Serializable Isolation Level
--Full isolation; safest, but slowest—no dirty, non-repeatable, or phantom reads.

BEGIN ISOLATION LEVEL SERIALIZABLE;

SELECT SUM(balance) FROM Accounts WHERE balance > 100;

-- Wait, then insert in another session...

SELECT SUM(balance) FROM Accounts WHERE balance > 100;
COMMIT;
-- Should block or throw serialization error if concurrent writes occurred

---------------------------------------------------------------------------------------------

ABORT;

-- 12 May 2025: Transactions and Concurrency

-- 1. Question:
-- In a transaction, if I perform multiple updates and an error happens in the third statement, but I have not used SAVEPOINT, what will happen if I issue a ROLLBACK?
-- Will my first two updates persist?

BEGIN;

-- First update
UPDATE accounts SET balance = balance - 100 WHERE name = 'Alice';

-- Second update
UPDATE accounts SET balance = balance + 50 WHERE name = 'Alice';

-- Error occurs on the third update
UPDATE accounts SET balance = balance - 200 WHERE name = 'Bobb'; -- Assume Bob doesn't exist

-- Since an error occurred, ROLLBACK will undo all updates
ROLLBACK;

-- undo the entire transaction
-- 2️. Question:
-- Suppose Transaction A updates Alice’s balance but does not commit. Can Transaction B read the new balance if the isolation level is set to READ COMMITTED?
--  Transaction B can see uncommitted changes from Transaction A if it reads during the transaction's execution.
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE name = 'Alice'; -- Change made but not committed
SELECT * FROM Accounts;
-- Transaction B can read the updated balance, even though Transaction A hasn't committed
SELECT balance FROM accounts WHERE name = 'Alice';


-- 3️. Question:
-- What will happen if two concurrent transactions both execute:
-- UPDATE tbl_bank_accounts SET balance = balance - 100 WHERE account_name = 'Alice';
-- at the same time? Will one overwrite the other?
--second transaction does not overwrite the first,it waits
-- Transaction 1
SELECT balance FROM accounts WHERE name = 'Alice';
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE name = 'Alice';
COMMIT;

-- Transaction 2
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE name = 'Alice';
COMMIT;


-- 4️. Question:
-- If I issue ROLLBACK TO SAVEPOINT after_alice;, will it only undo changes made after the savepoint or everything?
--only undoes changes made after the savepoint
BEGIN;

-- Savepoint before making changes
SAVEPOINT after_alice;

-- Make some changes
UPDATE accounts SET balance = balance - 100 WHERE name = 'Alice';

SELECT balance FROM accounts WHERE name = 'Alice';

-- Rollback to the savepoint
ROLLBACK TO SAVEPOINT after_alice;

-- Changes made after the savepoint are undone
COMMIT;


-- 5️. Question:
-- Which isolation level in PostgreSQL prevents phantom reads?
--SERIALIZABLE

-- 6️. Question:
-- Can Postgres perform a dirty read (reading uncommitted data from another transaction)?
--No, PostgreSQL does not support dirty reads, Default - Read Commited
-- Transaction A
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE name = 'Alice'; -- Uncommitted change
ABORT;
-- Transaction B (Cannot read uncommitted changes)
SELECT balance FROM accounts WHERE name = 'Alice'; -- Will only read committed data


-- 7️. Question:
-- If autocommit is ON (default in Postgres), and I execute an UPDATE, is it safe to assume the change is immediately committed?
-- if autocommit is ON, each statement is considered as the seperate statement , so its commited immediatley
-- after the execution 
-- Autocommit is ON by default
UPDATE accounts SET balance = balance - 100 WHERE account_name = 'Alice'; -- Immediately committed


-- 8️. Question:
-- If I do this:

-- BEGIN;
-- UPDATE accounts SET balance = balance - 500 WHERE id = 1;
-- -- (No COMMIT yet)
-- And from another session, I run:

-- SELECT balance FROM accounts WHERE id = 1;
-- Will the second session see the deducted balance?
--No, the second session will not see the deducted balance until the first session commits
-- First session (Uncommitted change)
BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;

-- Second session (Reading the uncommitted balance)
SELECT balance FROM accounts WHERE id = 1; -- It will see the old balance, not the deducted one

ABORT;