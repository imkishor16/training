-- SELECT Queries
-- List all films with their length and rental rate, sorted by length descending.
-- Columns: title, length, rental_rate
select title, length, rental_rate from film 
order by length desc

-- Find the top 5 customers who have rented the most films.
-- Hint: Use the rental and customer tables.
select c.customer_id, c.first_name, c.last_name, count(r.rental_id) as rental_count
from customer c
join rental r on c.customer_id = r.customer_id
group by c.customer_id, c.first_name, c.last_name
order by rental_count desc
limit 5;

-- Display all films that have never been rented.
-- Hint: Use LEFT JOIN between film and inventory → rental.

select f.film_id, f.title
from film f
left join inventory i on f.film_id = i.film_id
left join rental r on i.inventory_id = r.inventory_id
where r.rental_id is null;

-- JOIN Queries
-- List all actors who appeared in the film ‘Academy Dinosaur’.
-- Tables: film, film_actor, actor

select a.actor_id, a.first_name, a.last_name
from actor a
join film_actor fa on a.actor_id = fa.actor_id
join film f on fa.film_id = f.film_id
where f.title = 'Academy Dinosaur';

-- List each customer along with the total number of rentals they made and the total amount paid.
-- Tables: customer, rental, payment

select c.customer_id, c.first_name, c.last_name,
       count(r.rental_id) as total_rentals,
       sum(p.amount) as total_paid
from customer c
left join rental r on c.customer_id = r.customer_id
left join payment p on r.rental_id = p.rental_id
group by c.customer_id, c.first_name, c.last_name;

-- CTE-Based Queries
-- Using a CTE, show the top 3 rented movies by number of rentals.
-- Columns: title, rental_count

with rental_counts as (
    select f.title, count(r.rental_id) as rental_count
    from film f
    join inventory i on f.film_id = i.film_id
    join rental r on i.inventory_id = r.inventory_id
    group by f.title
)
select title, rental_count
from rental_counts
order by rental_count desc
limit 3;

-- Find customers who have rented more than the average number of films.
-- Use a CTE to compute the average rentals per customer, then filter.

with customer_rentals as (
    select customer_id, count(*) as rental_count
    from rental
    group by customer_id
),
average_rentals as (
    select avg(rental_count) as avg_rentals
    from customer_rentals
)
select cr.customer_id, cr.rental_count
from customer_rentals cr, average_rentals ar
where cr.rental_count > ar.avg_rentals;

-- Write a function that returns the total number of rentals for a given customer ID.
-- Function: get_total_rentals(customer_id INT)

create or replace function get_total_rentals(customer_id INT)
returns int as $$
declare
    total int;
begin
    select count(*) into total
    from rental
    where rental.customer_id = get_total_rentals.customer_id;
    return total;
end;
$$ language plpgsql;

select get_total_rentals(87);

-- Stored Procedure Questions
-- Write a stored procedure that updates the rental rate of a film by film ID and new rate.
-- Procedure: update_rental_rate(film_id INT, new_rate NUMERIC)

create or replace procedure update_rental_rate(p_film_id INT, p_new_rate NUMERIC)
language plpgsql
as $$
begin
    update film
    set rental_rate = p_new_rate
    where film_id = p_film_id;
end;
$$;


call update_rental_rate(133, 4.55);

select * from film;

-- Write a procedure to list overdue rentals (return date is NULL and rental date older than 7 days).
-- Procedure: get_overdue_rentals() that selects relevant columns.


create or replace procedure get_overdue_rentals()
language plpgsql
as $$
declare
    rental_rec RECORD;
    overdue_cursor cursor for
        select r.rental_id, r.rental_date, r.customer_id, i.film_id
        from rental r
        join inventory i on r.inventory_id = i.inventory_id
        where r.return_date is null
        and r.rental_date < NOW() - INTERVAL '7 days';
begin
    open overdue_cursor;

    loop
        fetch overdue_cursor into rental_rec;
        exit when not found;
        raise notice 'Overdue Rental - ID: %, Date: %, Customer: %, Film: %',
            rental_rec.rental_id, rental_rec.rental_date,
            rental_rec.customer_id, rental_rec.film_id;
    end loop;

    close overdue_cursor;
end;
$$;


call get_overdue_rentals();