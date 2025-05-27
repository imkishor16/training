Joins

-> Inner Join
-> Outer Join
	-> Right Join
	-> Left Join
	-> Full Join
-> Cross Join
-> Self Join

-- Print Auhtor and their books

	select au_id,title from titleauthor
	left join titles on titles.title_id = titleauthor.title_id;

-- Print Author's name with their book name

	select concat(au_fname,' ',au_lname) Author_name,title as Bookname from authors a
	join titleauthor ta on ta.au_id = a.au_id
	join titles t on t.title_id = ta.title_id;

-- Print the publisher's name, book name and the order date of the  books

	select pub_name publisher_name,title book_name, ord_date from publishers p
	join titles t on t.pub_id = p.pub_id
	join sales s on s.title_id = t.title_id;

-- Print the publisher name and the first book sale date for all the publishers

	select pub_name publisher_name,min(ord_date) from publishers p
	left join titles t on t.pub_id = p.pub_id
	left join sales s on s.title_id = t.title_id
	group by p.pub_name;


---------------------------------------Stored Procedure----------------------------------------------------

-- Example:
	create table Products
	(id int identity(1,1) constraint pk_productId primary key,
	name nvarchar(100) not null,
	details nvarchar(max))
	
	-- details - Json
	
	create proc proc_InsertProduct(@pname nvarchar(100),@pdetails nvarchar(max))
	as
	begin
    		insert into Products(name,details) values(@pname,@pdetails)
	end


	proc_InsertProduct'Mobile','{"brand":"Iqoo","spec":{"ram":"16GB","cpu":"snapdragon"}}'


	select * from Products

	select JSON_QUERY(details,'$.spec') spec from products;
	select JSON_VALUE(details,'$.brand') brand from products;


	create proc proc_UpdateProductSpec(@pid int,@newvalue varchar(20))
	as
	begin
   		update products set details = JSON_MODIFY(details, '$.spec.ram',@newvalue) where id = @pid
	end

	proc_UpdateProductSpec 2, '24GB'

-------------------------------------Bulk insert using stored procedure----------------------------------------

  create table Posts
  (id int primary key,
  title nvarchar(100),
  user_id int,
  body nvarchar(max))
Go

  select * from Posts

  create proc proc_BulInsertPosts(@jsondata nvarchar(max))
  as
  begin
		insert into Posts(user_id,id,title,body)
	  select userId,id,title,body from openjson(@jsondata)
	  with (userId int,id int, title varchar(100), body varchar(max))
  end

  delete from Posts

  proc_BulInsertPosts '
[
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
  },
  {
    "userId": 1,
    "id": 2,
    "title": "qui est esse",
    "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
  }]'

-------------
-> try_cast same like type cast
-> without try_cast
	->  select * from products where 
 	    json_value(details,'$.spec.cpu') = 2
	-> error:  Msg 245, Level 16, State 1, Line 107
		Conversion failed when converting the nvarchar value 'i5' to data type int.
-> with try_cast
	->  select * from products where 
  	    try_cast(json_value(details,'$.spec.cpu') as nvarchar(20)) = 'i5'
	-> no error


--> Note:json_value returns only string


 --create a procedure that brings post by taking the user_id as parameter
	 create proc proc_GetPostbyUserId(@value int)
 	as
 	begin
		select * from posts 
		where user_id = @value
	end
	go	
	proc_GetPostbyUserId 2