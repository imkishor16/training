--out parameter in procedure
--in parameter is default

use pubs
go
--- out parameter in procedure

select * from products where 
try_cast(json_value(detail,'$.spec.cpu') as nvarchar(20)) ='i5'


create proc proc_FilterProducts(@pcpu varchar(20), @pcount int out)
as
begin
set @pcount = (select count(*) from products where 
try_cast(json_value(detail,'$.spec.cpu') as nvarchar(20)) =@pcpu)
end

begin
declare @cnt int
exec proc_FilterProducts 'i5', @cnt out
print concat('The number of computers is ',@cnt)
end
------------------------------------------------------------------------------------------------------------------------------
-- bulk inserting from csv file

sp_help authors -- pre defined procedure "sp_.."

create table people
(id int primary key,
name nvarchar(20),
age int)

create or alter proc proc_BulkInsert(@filepath nvarchar(500))
as
begin
   declare @insertQuery nvarchar(max)

   set @insertQuery = 'BULK INSERT people from '''+ @filepath +'''
   with(
   FIRSTROW =2,
   FIELDTERMINATOR='','',
   ROWTERMINATOR = ''\n'')'
   exec sp_executesql @insertQuery
end
 
proc_BulkInsert "C:\Users\VC\Downloads\Data.xlsx" --success

select * from people

-------------------------------------------------------------------------------------------------------------------------
--exception handeling and looging them in seperate table

create table BulkInsertLog
(LogId int identity(1,1) primary key,
FilePath nvarchar(1000),
status nvarchar(50) constraint chk_status Check(status in('Success','Failed')),
Message nvarchar(1000),
InsertedOn DateTime default GetDate())


create or alter proc proc_BulkInsert(@filepath nvarchar(500))
as
begin
  Begin try
	   declare @insertQuery nvarchar(max)

	   set @insertQuery = 'BULK INSERT people from '''+ @filepath +'''
	   with(
	   FIRSTROW =2,
	   FIELDTERMINATOR='','',
	   ROWTERMINATOR = ''\n'')'

	   exec sp_executesql @insertQuery

	   insert into BulkInsertLog(filepath,status,message)
	   values(@filepath,'Success','Bulk insert completed')
  end try
  begin catch
		 insert into BulkInsertLog(filepath,status,message)
		 values(@filepath,'Failed',Error_Message())
  END Catch
end

proc_BulkInsert "C:\Users\VC\Downloads\Data.xlsx" --error

select * from BulkInsertLog

truncate table people

------------------------------------------------------------------------------------------------------
--CTE - common table expression
-- temporary table
-- created as the object 
-- wrk with reference later 
-- mstly wrk on nested queries

with cteAuthors 
as 
 (select au_id, concat(au_fname,' ',au_lname) author_name from authors)
 (update cteAuthors set au_fname = au_fname +'updated')

select * from cteAuthors

--------------------------------------------------------------------------------------------------------
--pagination 


declare @page int =2, @pageSize int=10;
with PaginatedBooks as
( select  title_id,title, price, ROW_Number() over (order by price desc) as RowNum
  from titles
)
select * from PaginatedBooks where rowNUm between((@page-1)*@pageSize) and (@page*@pageSize)

--create a sp that will take the page number and size as param and print the books

create or alter proc proc_PaginateTitles( @page int =1, @pageSize int=10)
as
begin
with PaginatedBooks as
( select  title_id,title, price, ROW_Number() over (order by price desc) as RowNum
  from titles
)
select * from PaginatedBooks where rowNUm between((@page-1)*(@pageSize+1)) and (@page*@pageSize)
end

exec proc_PaginateTitles 2,5
---------------------------------------------------------------------------------------------------------
-- offset( updated one used for pagination insted of proc)
-- go after 10 rows and fetch the next 10 rows

 select  title_id,title, price
  from titles
  order by price desc
  offset 10 rows fetch next 10 rows only

-----------------------------------------------------------------------------------------------------------
--function 
--return mandatory
--scalar function -return the single value 

create function  fn_CalculateTax(@baseprice float, @tax float)
returns float
as
begin
     return (@baseprice +(@baseprice*@tax/100))
end

select dbo.fn_CalculateTax(1000,10)

select title,dbo.fn_CalculateTax(price,12) Tax from titles

-- table valued function(TVF)
-- fucntion itself will return a table , so it can be used after the FROM in the select query

create function fn_tableSample(@minprice float)
returns table
as
return select title,price from titles where price>= @minprice

select * from dbo.fn_tableSample(10)

---------------------------------------------------------------------------------------------------------------

--How can you produce a list of all members who have used a tennis court? Include in your output the name of the court, and the name of the member formatted as a single column. Ensure no duplicate data, and order by the member name followed by the facility name.
select distinct concat(m.firstname,' ',m.surname) member,name facility from cd.members m 
join cd.bookings b on m.memid = b.memid
join cd.facilities f on b.facid = f.facid
where name like '%Tennis Court%'
order by member, facility

--How can you produce a list of bookings on the day of 2012-09-14 which will cost the member (or guest) more than $30? Remember that guests have different costs to members (the listed costs are per half-hour 'slot'), and the guest user is always ID 0. Include in your output the name of the facility, the name of the member formatted as a single column, and the cost. Order by descending cost, and do not use any subqueries.
select mems.firstname || ' ' || mems.surname as member, 
	facs.name as facility, 
	case 
		when mems.memid = 0 then
			bks.slots*facs.guestcost
		else
			bks.slots*facs.membercost
	end as cost
        from
                cd.members mems                
                inner join cd.bookings bks
                        on mems.memid = bks.memid
                inner join cd.facilities facs
                        on bks.facid = facs.facid
        where
		bks.starttime >= '2012-09-14' and 
		bks.starttime < '2012-09-15' and (
			(mems.memid = 0 and bks.slots*facs.guestcost > 30) or
			(mems.memid != 0 and bks.slots*facs.membercost > 30)
		)
order by cost desc;  