 -- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create a stored procedure to encrypt a given text
-- Task: Write a stored procedure sp_encrypt_text that takes a plain text input (e.g., email or mobile number) and returns an encrypted version using PostgreSQL's pgcrypto extension.
-- Use pgp_sym_encrypt(text, key) from pgcrypto.

CREATE OR REPLACE FUNCTION sp_encrypt_text(p_text TEXT, p_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_encrypt(p_text, p_key);
END;
$$ LANGUAGE plpgsql;

SELECT sp_encrypt_text('kcm@presidio.com', 'secretKey');

-- 2. Create a stored procedure to compare two encrypted texts
-- Task: Write a procedure sp_compare_encrypted that takes two encrypted values and checks if they decrypt to the same plain text. 

CREATE OR REPLACE FUNCTION sp_compare_encrypted(p_enc1 TEXT, p_enc2 TEXT, p_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_dec1 TEXT;
    v_dec2 TEXT;
BEGIN
    v_dec1 := pgp_sym_decrypt(p_enc1::BYTEA, p_key);
    v_dec2 := pgp_sym_decrypt(p_enc2::BYTEA, p_key);
    
    RETURN v_dec1 = v_dec2;
END;
$$ LANGUAGE plpgsql;


DO $$
DECLARE
    enc1 TEXT;
    enc2 TEXT;
    result BOOLEAN;
BEGIN
    enc1 := sp_encrypt_text('kcm@presidio.com', 'my_secret_key');
    enc2 := sp_encrypt_text('kcm@presidio.com', 'my_secret_key');
    -- enc2 := sp_encrypt_text('KCM@PRESIDIO.COM', 'my_secret_key');

    result := sp_compare_encrypted(enc1, enc2, 'my_secret_key');
    RAISE NOTICE 'Match: %', result;
END;
$$;



-- 3. Create a stored procedure to partially mask a given text
-- Task: Write a procedure sp_mask_text that:
-- Shows only the first 2 and last 2 characters of the input string
-- Masks the rest with *
-- E.g., input: 'john.doe@example.com' → output: 'jo***************om'
 
CREATE OR REPLACE FUNCTION sp_mask_text(p_text TEXT)
RETURNS TEXT AS $$
DECLARE
    v_len INT;
    v_masked TEXT;
BEGIN
    v_len := length(p_text);
    IF v_len <= 4 THEN
        RETURN repeat('*', v_len); 
    END IF;
    
    v_masked := substring(p_text from 1 for 2) ||
                repeat('*', v_len - 4) ||
                substring(p_text from v_len - 1 for 2);
    
    RETURN v_masked;
END;
$$ LANGUAGE plpgsql;

SELECT sp_mask_text('kcm@presidio.com');



-- 4. Create a procedure to insert into customer with encrypted email and masked name
-- Task:
-- Call sp_encrypt_text for email
-- Call sp_mask_text for first_name
-- Insert masked and encrypted values into the customer table
-- Use any valid address_id and store_id to satisfy FK constraints. 


CREATE OR REPLACE PROCEDURE sp_insert_customer(
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_store_id INT,
    p_address_id INT,
    p_key TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_masked_name TEXT;
    v_encrypted_email TEXT;
BEGIN
    v_masked_name := sp_mask_text(p_first_name);
    v_encrypted_email := sp_encrypt_text(p_email, p_key);

    INSERT INTO customer (first_name, last_name, email, store_id, address_id)
    VALUES (v_masked_name, p_last_name, v_encrypted_email, p_store_id, p_address_id);
END;
$$;


ALTER TABLE customer
ALTER COLUMN email TYPE TEXT;

CALL sp_insert_customer('kishore','cm','kcm@presidio.com',1,1,'secretkey');
SELECT customer_id, first_name, email FROM customer ORDER BY customer_id DESC LIMIT 5;


-- 5. Create a procedure to fetch and display masked first_name and decrypted email for all customers
-- Task:
-- Write sp_read_customer_masked() that:
-- Loops through all rows
-- Decrypts email
-- Displays customer_id, masked first name, and decrypted email

CREATE OR REPLACE PROCEDURE sp_read_customer_masked(p_key TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    v_email TEXT;
BEGIN
    FOR rec IN SELECT customer_id, first_name, email FROM customer LOOP
        --  email to BYTEA for decryption
        v_email := pgp_sym_decrypt(rec.email::BYTEA, p_key);
        
        -- pirnt stuff
        RAISE NOTICE 'ID: %, Name: %, Email: %', rec.customer_id, rec.first_name, v_email;
    END LOOP;
END;
$$;


SELECT customer_id, first_name, email
FROM customer
ORDER BY customer_id DESC
LIMIT 1;

CALL sp_read_customer_masked('secretkey');


