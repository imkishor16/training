Design the database for a shop which sells products
Points for consideration
  1) One product can be supplied by many suppliers
  2) One supplier can supply many products
  3) All customers details have to present
  4) A customer can buy more than one product in every purchase
  5) Bill for every purchase has to be stored
  6) These are just details of one shop

Product 
product_id, name, price, description, quantity

Country
id, name

State 
id, name, country_id

City
id, name, state_id

Area 
id, name, zipcode, city_id

Supplier
supplier_id, name, address, 

Product_Supplier 
product_id, supplier_id

Customer
customer_id, name, email, phone, address

Bill 
bill_id, customer_id, total_price, purchase_date

Bill_Item 
bill_id, product_id, quantity, unit_price


CREATE TABLE Product (
    product_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    quantity INT NOT NULL
);


CREATE TABLE Supplier (
    supplier_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT
);


CREATE TABLE Product_Supplier (
    product_id INT,
    supplier_id INT,
    PRIMARY KEY (product_id, supplier_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);


CREATE TABLE Customer (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT
);

CREATE TABLE Bill (
    bill_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    purchase_date DATETIME NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);


CREATE TABLE Bill_Item (
    bill_id INT,
    product_id INT,
    supplier_id INT
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (bill_id, product_id),
    FOREIGN KEY (bill_id) REFERENCES Bill(bill_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);