CREATE DATABASE Shop;

USE Shop;

CREATE TABLE Categories (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL
);

CREATE TABLE Country (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE State (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_id INT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES Country(id)
);

CREATE TABLE City (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_id INT NOT NULL,
    FOREIGN KEY (state_id) REFERENCES State(id)
);

CREATE TABLE Area (
    zipcode VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city_id INT NOT NULL,
    FOREIGN KEY (city_id) REFERENCES City(id)
);

CREATE TABLE Address (
    id INT PRIMARY KEY,
    door_number VARCHAR(20),
    addressline1 VARCHAR(200),
    zipcode VARCHAR(10) NOT NULL,
    FOREIGN KEY (zipcode) REFERENCES Area(zipcode)
);

CREATE TABLE Supplier (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address_id INT NOT NULL,
    status BOOLEAN NOT NULL,
    FOREIGN KEY (address_id) REFERENCES Address(id)
);

CREATE TABLE Product (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    description TEXT,
    image VARCHAR(255)
);

CREATE TABLE Product_Supplier (
    transaction_id INT PRIMARY KEY,
    product_id INT NOT NULL,
    supplier_id INT NOT NULL,
    date_of_supply DATE NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (supplier_id) REFERENCES Supplier(id)
);

CREATE TABLE Customer (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    age INT,
    address_id INT NOT NULL,
    FOREIGN KEY (address_id) REFERENCES Address(id)
);

CREATE TABLE Orders (
    order_number INT PRIMARY KEY,
    customer_id INT NOT NULL,
    date_of_order DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES Customer(id)
);

CREATE TABLE Order_Details (
    id INT PRIMARY KEY,
    order_number INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_number) REFERENCES Orders(order_number),
    FOREIGN KEY (product_id) REFERENCES Product(id)
);
