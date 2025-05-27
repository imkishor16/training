Cursor-Based Questions (5):
1) Write a cursor that loops through all films and prints titles longer than 120 minutes.
DO $$
DECLARE
    film_rec RECORD;
BEGIN
    FOR film_rec IN SELECT title, length FROM film LOOP
        IF film_rec.length > 120 THEN
            RAISE NOTICE 'Long Film: %', film_rec.title;
        END IF;
    END LOOP;
END $$;



2) Create a cursor that iterates through all customers and counts how many rentals each made.
DO $$
DECLARE
    customer_rec RECORD;
    rental_count INTEGER;
BEGIN
    FOR customer_rec IN SELECT customer_id, first_name, last_name FROM customer LOOP
        SELECT COUNT(*) INTO rental_count FROM rental WHERE rental.customer_id = customer_rec.customer_id;
        RAISE NOTICE 'Customer % % has % rentals', customer_rec.first_name, customer_rec.last_name, rental_count;
    END LOOP;
END $$;


3) Using a cursor, update rental rates: Increase rental rate by $1 for films with less than 5 rentals.
DO $$
DECLARE
    film_rec RECORD;
    rental_count INTEGER;
BEGIN
    FOR film_rec IN SELECT film_id, rental_rate FROM film LOOP
        SELECT COUNT(*) INTO rental_count FROM inventory i
        JOIN rental r ON i.inventory_id = r.inventory_id
        WHERE i.film_id = film_rec.film_id;

        IF rental_count < 5 THEN
            UPDATE film SET rental_rate = rental_rate + 1 WHERE film_id = film_rec.film_id;
        END IF;
    END LOOP;
END $$;

4) Create a function using a cursor that collects titles of all films from a particular category.
CREATE OR REPLACE FUNCTION get_titles_by_category(cat_name TEXT)
RETURNS TABLE(title TEXT) AS $$
DECLARE
    film_rec RECORD;
BEGIN
    FOR film_rec IN
        SELECT f.title FROM film f
        JOIN film_category fc ON f.film_id = fc.film_id
        JOIN category c ON c.category_id = fc.category_id
        WHERE c.name = cat_name
    LOOP
        title := film_rec.title;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


5) Loop through all stores and count how many distinct films are available in each store using a cursor.
DO $$
DECLARE
    store_rec RECORD;
    film_count INTEGER;
BEGIN
    FOR store_rec IN SELECT store_id FROM store LOOP
        SELECT COUNT(DISTINCT i.film_id)
        INTO film_count
        FROM inventory i
        WHERE i.store_id = store_rec.store_id;

        RAISE NOTICE 'Store % has % distinct films', store_rec.store_id, film_count;
    END LOOP;
END $$;


Trigger-Based Questions (5)
6) Write a trigger that logs whenever a new customer is inserted.
CREATE TABLE customer_log (
    customer_id INT,
    log_time TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION log_new_customer()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customer_log(customer_id) VALUES (NEW.customer_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_customer
AFTER INSERT ON customer
FOR EACH ROW
EXECUTE FUNCTION log_new_customer();


7) Create a trigger that prevents inserting a payment of amount 0.
CREATE OR REPLACE FUNCTION prevent_zero_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount = 0 THEN
        RAISE EXCEPTION 'Zero payment not allowed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_zero_payment
BEFORE INSERT ON payment
FOR EACH ROW
EXECUTE FUNCTION prevent_zero_payment();


8) Set up a trigger to automatically set last_update on the film table before update.
CREATE OR REPLACE FUNCTION update_last_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_update := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_film
BEFORE UPDATE ON film
FOR EACH ROW
EXECUTE FUNCTION update_last_update();


9) Create a trigger to log changes in the inventory table (insert/delete).
CREATE TABLE inventory_log (
    inventory_id INT,
    action TEXT,
    log_time TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION log_inventory_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO inventory_log (inventory_id, action) VALUES (NEW.inventory_id, 'INSERT');
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO inventory_log (inventory_id, action) VALUES (OLD.inventory_id, 'DELETE');
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_log
AFTER INSERT OR DELETE ON inventory
FOR EACH ROW
EXECUTE FUNCTION log_inventory_changes();


10) Write a trigger that ensures a rental can’t be made for a customer who owes more than $50.
CREATE OR REPLACE FUNCTION check_customer_debt()
RETURNS TRIGGER AS $$
DECLARE
    total_due NUMERIC;
BEGIN
    SELECT SUM(amount) INTO total_due
    FROM payment
    WHERE customer_id = NEW.customer_id AND amount < 0;

    IF total_due < -50 THEN
        RAISE EXCEPTION 'Customer owes more than $50';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_debt
BEFORE INSERT ON rental
FOR EACH ROW
EXECUTE FUNCTION check_customer_debt();


Transaction-Based Questions (5)
11) Write a transaction that inserts a customer and an initial rental in one atomic operation.
BEGIN;

INSERT INTO customer (store_id, first_name, last_name, email, address_id, active)
VALUES (1, 'John', 'Doe', 'john@example.com', 5, TRUE)
RETURNING customer_id;

-- Use returned customer_id in the INSERT into rental
-- Example assumes inventory_id 1 and staff_id 1
INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
VALUES (NOW(), 1, currval(pg_get_serial_sequence('customer', 'customer_id')), 1);

COMMIT;


12) Simulate a failure in a multi-step transaction (update film + insert into inventory) and roll back.
BEGIN;

UPDATE film SET rental_rate = rental_rate + 2 WHERE film_id = 1;

-- Simulate error
DO $$ BEGIN RAISE EXCEPTION 'Simulated failure'; END $$;

INSERT INTO inventory (film_id, store_id) VALUES (1, 1);

-- This will not be reached
COMMIT;


13) Create a transaction that transfers an inventory item from one store to another.
BEGIN;

UPDATE inventory SET store_id = 2 WHERE inventory_id = 10;

INSERT INTO inventory_log (inventory_id, action) VALUES (10, 'TRANSFERRED');

COMMIT;


14) Demonstrate SAVEPOINT and ROLLBACK TO SAVEPOINT by updating payment amounts, then undoing one.
BEGIN;

UPDATE payment SET amount = amount + 5 WHERE payment_id = 1;

SAVEPOINT before_second_update;

UPDATE payment SET amount = amount + 10 WHERE payment_id = 2;

-- Undo second update
ROLLBACK TO SAVEPOINT before_second_update;

COMMIT;


15) Write a transaction that deletes a customer and all associated rentals and payments, ensuring atomicity.
Procedure: get_overdue_rentals() that selects relevant columns.
BEGIN;

DELETE FROM payment WHERE customer_id = 100;
DELETE FROM rental WHERE customer_id = 100;
DELETE FROM customer WHERE customer_id = 100;

COMMIT;
