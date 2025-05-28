--Cursor
--https://learn.microsoft.com/en-us/sql/t-sql/language-elements/declare-cursor-transact-sql?view=sql-server-ver16

--- cursor 

CREATE TABLE customers (
    customer_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100),
    email VARCHAR(100),
    city VARCHAR(50)
);


INSERT INTO customers (name, email, city)
VALUES 
('Alice Johnson', 'alice.johnson@example.com', 'New York'),
('Bob Smith', 'bob.smith@example.com', 'Los Angeles'),
('Charlie Brown', 'charlie.brown@example.com', 'Chicago'),
('Diana Prince', 'diana.prince@example.com', 'Boston'),
('Ethan Hunt', 'ethan.hunt@example.com', 'San Francisco');

select * from customers

declare @cus_name nvarchar(100)

declare cus_cursor cursor for 
select name from customers

open cus_cursor
fetch next from cus_cursor into @cus_name

while @@FETCH_STATUS=0
begin
print 'sent msg to '+@cus_name
fetch next from cus_cursor into @cus_name
end

CLOSE cus_cursor
DEALLOCATE cus_cursor

--------------------

declare @cus_name nvarchar(100)

declare cus_cursor scroll cursor for 
select name from customers

open cus_cursor
fetch last from cus_cursor into @cus_name
fetch prior from cus_cursor into @cus_name
fetch absolute 2 from cus_cursor into @cus_name
fetch relative -2 from cus_cursor into @cus_name

print @cus_name

CLOSE cus_cursor
DEALLOCATE cus_cursor

-----------------------------


--Transaction
--https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver16

--Trigger
--https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver16



-- 1) List all orders with the customer name and the employee who handled the order.
--(Join Orders, Customers, and Employees)
select OrderID, ContactName, CONCAT(FirstName,' ',LastName) Employee_Name from Orders o 
join Customers c on o.CustomerID = c.CustomerID
join Employees e on e.EmployeeID = o.EmployeeID


--2) Get a list of products along with their category and supplier name.
--(Join Products, Categories, and Suppliers)
select ProductName, CategoryName, CompanyName as SupplierName from Suppliers s
join Products p on s.SupplierID = p.SupplierID
join Categories c on c.CategoryID = p.CategoryID

--3) Show all orders and the products included in each order with quantity and unit price.
--(Join Orders, Order Details, Products)
select o.*, ProductName, Quantity, od.UnitPrice from Products p
join [Order Details] od on p.ProductID = od.ProductID
join Orders o on od.OrderID = o.OrderID

--4) List employees who report to other employees (manager-subordinate relationship).
--(Self join on Employees)
select concat(e.FirstName,' ',e.LastName)Subordinate,concat(em.FirstName,' ',em.LastName) Manager from Employees e 
join Employees em on em.EmployeeID = e.ReportsTo

--5) Display each customer and their total order count.
--(Join Customers and Orders, then GROUP BY)
select c.ContactName, COUNT(o.OrderID) TotalCount from Orders o 
join Customers c on o.CustomerID = c.CustomerID
group by c.CustomerID, c.ContactName
order by TotalCount desc


--6) Find the average unit price of products per category.
--Use AVG() with GROUP BY
select c.CategoryName ,AVG(p.UnitPrice)AvgUnitPrice from Products p 
join Categories c on p.CategoryID = c.CategoryID
group by c.CategoryName

--7) List customers where the contact title starts with 'Owner'.
--Use LIKE or LEFT(ContactTitle, 5)
select ContactName from Customers
where ContactTitle like 'Owner%'

--8) Show the top 5 most expensive products.
--Use ORDER BY UnitPrice DESC and TOP 5
select top 5 ProductName from Products 
order by UnitPrice

--9) Return the total sales amount (quantity × unit price) per order.
--Use SUM(OrderDetails.Quantity * OrderDetails.UnitPrice) and GROUP BY
select od.OrderID, SUM(od.Quantity* od.UnitPrice) SalesAmount from [Order Details] od 
group by OrderID

--10) Create a stored procedure that returns all orders for a given customer ID.
--Input: @CustomerID
create procedure proc_GetOrder @customer_id nchar(5)
as 
begin
select * from Orders o where o.CustomerID = @customer_id
end

select * from Orders

proc_GetOrder 'VINET'

--11) Write a stored procedure that inserts a new product.
--Inputs: ProductName, SupplierID, CategoryID, UnitPrice, etc.

create procedure pro_AddProduct 
@product_name nvarchar(40), @supplier_id int, @category_id int, 
@quantity_per_unit nvarchar(20), @unit_price money, @units_in_stock smallint, @unit_on_order smallint, 
@reorder_level smallint, @discontinued bit
as
begin
	insert into Products (ProductName, SupplierID, CategoryID, 
        QuantityPerUnit, UnitPrice, UnitsInStock, UnitsOnOrder, 
        ReorderLevel, Discontinued) values ( @product_name, @supplier_id, @category_id,
        @quantity_per_unit, @unit_price, @units_in_stock, @unit_on_order,
        @reorder_level, @discontinued)
end

pro_AddProduct 'New Product', 1, 2, '10 boxes', 25.50, 50, 10, 5, 0



--12) Create a stored procedure that returns total sales per employee.
--Join Orders, Order Details, and Employees
alter procedure pro_GetTotalSales
@emp_id int 
as 
begin 
	select Sum(od.UnitPrice*od.Quantity) TotalSales from Orders o 
	join [Order Details] od on o.OrderID = od.OrderID
	join Employees e on o.EmployeeID = e.EmployeeID
	where e.EmployeeID = @emp_id
end

pro_GetTotalSales 2



--13) Use a CTE to rank products by unit price within each category.
--Use ROW_NUMBER() or RANK() with PARTITION BY CategoryID

with RankedProducts as 
(
select ProductID, ProductName, CategoryID, UnitPrice, 
ROW_NUMBER() OVER (PARTITION BY CategoryID ORDER BY UnitPrice DESC) AS PriceRank from Products 
)

select * from RankedProducts 
order by CategoryID,PriceRank

--14) Create a CTE to calculate total revenue per product and filter products with revenue > 10,000.

with ProductRevenue as (
    select 
        od.ProductID,
        p.ProductName,
        sum(od.Quantity * od.UnitPrice * (1 - od.Discount)) as TotalRevenue
    from 
        [Order Details] od
    join 
        Products p on od.ProductID = p.ProductID
    group by 
        od.ProductID, p.ProductName
)
select * 
from ProductRevenue
where TotalRevenue > 10000
order by TotalRevenue desc;


--15) Use a CTE with recursion to display employee hierarchy.
--Start from top-level employee (ReportsTo IS NULL) and drill down


with employee_hierarchy as (
   
    select 
        employeeid,
        firstname,
        lastname,
        reportsto,
        1 as level
    from employees
    where reportsto is null
    union all
    select 
        e.employeeid,
        e.firstname,
        e.lastname,
        e.reportsto,
        eh.level + 1
    from employees e
    join employee_hierarchy eh on e.reportsto = eh.employeeid
)
select * 
from employee_hierarchy
order by level, reportsto, employeeid;