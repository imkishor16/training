-- You are tasked with building a PostgreSQL-backed database for an EdTech company that manages online training and certification programs for individuals across various technologies.

-- The goal is to:

-- Design a normalized schema

-- Support querying of training data

-- Ensure secure access

-- Maintain data integrity and control over transactional updates

-- Database planning (Nomalized till 3NF)

-- A student can enroll in multiple courses

-- Each course is led by one trainer

-- Students can receive a certificate after passing

-- Each certificate has a unique serial number

-- Trainers may teach multiple courses



-- Tables to Design (Normalized to 3NF):

-- 1. **students**

--    * `student_id (PK)`, `name`, `email`, `phone`

-- 2. **courses**

--    * `course_id (PK)`, `course_name`, `category`, `duration_days`

-- 3. **trainers**

--    * `trainer_id (PK)`, `trainer_name`, `expertise`

-- 4. **enrollments**

--    * `enrollment_id (PK)`, `student_id (FK)`, `course_id (FK)`, `enroll_date`

-- 5. **certificates**

--    * `certificate_id (PK)`, `enrollment_id (FK)`, `issue_date`, `serial_no`

-- 6. **course\_trainers** (Many-to-Many if needed)

--    * `course_id`, `trainer_id`



-- Students Table

CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15)
);


--Trainers Table

CREATE TABLE trainers (
    trainer_id SERIAL PRIMARY KEY,
    trainer_name VARCHAR(100) NOT NULL,
    expertise TEXT
);


--Courses Table

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    duration_days INT CHECK (duration_days > 0)
);


--Enrollements Table

CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enroll_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE(student_id, course_id) 
);

-- a student should enroll only once in the same course.

-- Certificates Table

CREATE TABLE certificates (
    certificate_id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL UNIQUE,
    issue_date DATE DEFAULT CURRENT_DATE,
    serial_no UUID NOT NULL UNIQUE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id)
);


--Course Trainers

CREATE TABLE course_trainers (
    course_id INT NOT NULL,
    trainer_id INT NOT NULL,
    PRIMARY KEY (course_id, trainer_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);


 



-- Phase 2: DDL & DML

-- * Create all tables with appropriate constraints (PK, FK, UNIQUE, NOT NULL)

--Students
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15)
);

--Courses
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    duration_days INT CHECK (duration_days > 0)
);

--Trainers
CREATE TABLE trainers (
    trainer_id SERIAL PRIMARY KEY,
    trainer_name VARCHAR(100) NOT NULL,
    expertise TEXT
);

-- Enrollments
CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enroll_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE(student_id, course_id)
);

-- Certificates
CREATE TABLE certificates (
    certificate_id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL UNIQUE,
    issue_date DATE DEFAULT CURRENT_DATE,
    serial_no UUID NOT NULL UNIQUE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id)
);

--Course-Trainers (Many-to-Many)
CREATE TABLE course_trainers (
    course_id INT NOT NULL,
    trainer_id INT NOT NULL,
    PRIMARY KEY (course_id, trainer_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);


-- * Insert sample data using `INSERT` statements

CREATE EXTENSION IF NOT EXISTS pgcrypto;


INSERT INTO students (name, email, phone) VALUES
('A', 'A@example.com', '12334567890'),
('B', 'B@example.com', '2645678901'),
('C', 'C@example.com', '3456789042');

INSERT INTO trainers (trainer_name, expertise) VALUES
('X', 'Data Science, Machine Learning'),
('Y', 'Cybersecurity, Networks');

INSERT INTO courses (course_name, category, duration_days) VALUES
('Intro to SQL', 'Programming', 30),
('Networking Basics', 'Security', 45),
('Data Science with AI', 'Data Science', 60);

INSERT INTO course_trainers (course_id, trainer_id) VALUES
(4, 4),
(2, 2),
(6, 4),
(6, 3); 


INSERT INTO enrollments (student_id, course_id, enroll_date) VALUES
(4, 4, '2024-08-07'),
(5, 5, '2024-08-05'),
(4, 6, '2024-08-11');


INSERT INTO certificates (enrollment_id, issue_date, serial_no) VALUES
(4, '2024-9-01', gen_random_uuid()),
(5, '2024-1-10', gen_random_uuid());

SELECT * FROM students;
SELECT * FROM trainers;
SELECT * FROM courses;
SELECT * FROM course_trainers;
SELECT * FROM enrollments;
SELECT * FROM certificates;

-- * Create indexes on `student_id`, `email`, and `course_id`


CREATE INDEX idx_students_student_id ON students(student_id);

CREATE INDEX idx_students_email ON students(email);

CREATE INDEX idx_courses_course_id ON courses(course_id);







-- Phase 3: SQL Joins Practice

-- Write queries to:

-- 1. List students and the courses they enrolled in

SELECT 
    s.student_id,
    s.name AS student_name,
    c.course_id,
    c.course_name,
    e.enroll_date
FROM 
    enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
ORDER BY s.student_id, c.course_id;


-- 2. Show students who received certificates with trainer names

SELECT 
    s.name AS student_name,
    c.course_name,
    cert.serial_no,
    cert.issue_date,
    t.trainer_name
FROM 
    certificates cert
JOIN enrollments e ON cert.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
JOIN course_trainers ct ON c.course_id = ct.course_id
JOIN trainers t ON ct.trainer_id = t.trainer_id
ORDER BY cert.issue_date;

-- 3. Count number of students per course

SELECT 
    c.course_name,
    COUNT(e.student_id) AS total_students
FROM 
    courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name
ORDER BY total_students DESC;


---

-- Phase 4: Functions & Stored Procedures

-- Function:

-- Create `get_certified_students(course_id INT)`
-- → Returns a list of students who completed the given course and received certificates.
CREATE OR REPLACE FUNCTION get_certified_students(p_course_id INT)
RETURNS TABLE (
    student_id INT,
    student_name VARCHAR,
    course_name VARCHAR,
    serial_no UUID,
    issue_date DATE
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.student_id,
        s.name,
        c.course_name,
        cert.serial_no,
        cert.issue_date
    FROM
        certificates cert
    JOIN enrollments e ON cert.enrollment_id = e.enrollment_id
    JOIN students s ON e.student_id = s.student_id
    JOIN courses c ON e.course_id = c.course_id
    WHERE
        c.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM get_certified_students(1);

-- Stored Procedure:

-- Create `sp_enroll_student(p_student_id, p_course_id)`
-- → Inserts into `enrollments` and conditionally adds a certificate if completed (simulate with status flag).
CREATE OR REPLACE PROCEDURE sp_enroll_student(
    p_student_id INT,
    p_course_id INT,
    p_completed BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_enrollment_id INT;
BEGIN
   
    INSERT INTO enrollments (student_id, course_id)
    VALUES (p_student_id, p_course_id)
    ON CONFLICT (student_id, course_id) DO NOTHING
    RETURNING enrollment_id INTO v_enrollment_id;

    IF v_enrollment_id IS NULL THEN
        SELECT enrollment_id INTO v_enrollment_id
        FROM enrollments
        WHERE student_id = p_student_id AND course_id = p_course_id;
    END IF;

    IF p_completed THEN
        INSERT INTO certificates (enrollment_id, serial_no)
        VALUES (
            v_enrollment_id,
            gen_random_uuid()
        )
        ON CONFLICT (enrollment_id) DO NOTHING;
    END IF;
END;
$$;

-- Enroll student 4 in course 6,  completion
CALL sp_enroll_student(4, 6, TRUE);

-- Enroll student 5 in course 5, not completed
CALL sp_enroll_student(5, 5, FALSE);


-- ---

-- Phase 5: Cursor

-- Use a cursor to:

-- * Loop through all students in a course
-- * Print name and email of those who do not yet have certificates

CREATE OR REPLACE PROCEDURE sp_list_uncertified_students(p_course_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
  
    student_cursor CURSOR FOR
        SELECT
            s.student_id,
            s.name,
            s.email,
            e.enrollment_id
        FROM enrollments e
        JOIN students s ON s.student_id = e.student_id
        WHERE e.course_id = p_course_id;

    rec RECORD;
    cert_exists BOOLEAN;
BEGIN
    
    OPEN student_cursor;
    LOOP
        FETCH student_cursor INTO rec;
        EXIT WHEN NOT FOUND;

        
        SELECT EXISTS (
            SELECT 1 FROM certificates
            WHERE enrollment_id = rec.enrollment_id
        ) INTO cert_exists;


        IF NOT cert_exists THEN
            RAISE NOTICE 'Name: %, Email: %', rec.name, rec.email;
        END IF;
    END LOOP;
    CLOSE student_cursor;
END;
$$;

CALL sp_list_uncertified_students(3);  

INSERT INTO students (name, email, phone)
VALUES ('kishore', 'kishore@gmail.com', '123456789');


INSERT INTO enrollments (student_id, course_id, enroll_date)
VALUES (7, 6, '2025-07-16');

CALL sp_list_uncertified_students(6);  



---

-- Phase 6: Security & Roles

-- 1. Create a `readonly_user` role:

--    * Can run `SELECT` on `students`, `courses`, and `certificates`
--    * Cannot `INSERT`, `UPDATE`, or `DELETE`


CREATE ROLE readonly_user LOGIN PASSWORD 'readonly123';

GRANT SELECT ON students, courses, certificates TO readonly_user;

REVOKE INSERT, UPDATE, DELETE ON students, courses, certificates FROM readonly_user;

SELECT * FROM students; -- success

INSERT INTO students (name, email, phone) VALUES ('Test User', 'test@example.com', '999'); --fail


-- 2. Create a `data_entry_user` role:

--    * Can `INSERT` into `students`, `enrollments`
--    * Cannot modify certificates directly


CREATE ROLE data_entry_user LOGIN PASSWORD 'entry123';

GRANT INSERT ON students, enrollments TO data_entry_user;

REVOKE ALL ON certificates FROM data_entry_user;

REVOKE UPDATE, DELETE ON students, enrollments FROM data_entry_user;

GRANT USAGE, SELECT ON SEQUENCE students_student_id_seq TO data_entry_user;
GRANT UPDATE ON SEQUENCE students_student_id_seq TO data_entry_user;

GRANT USAGE, SELECT ON SEQUENCE enrollments_enrollment_id_seq TO data_entry_user;
GRANT UPDATE ON SEQUENCE enrollments_enrollment_id_seq TO data_entry_user;

--testing

INSERT INTO students (name, email, phone)
VALUES ('Test Entry', 'ent@example.com', '1234567890'); --success

INSERT INTO enrollments (student_id, course_id, enroll_date)
VALUES (3, 1, CURRENT_DATE); -- success

SELECT * FROM certificates; --fail

UPDATE students SET name = 'Hack' WHERE student_id = 5; --fail




---

-- Phase 7: Transactions & Atomicity

-- Write a transaction block that:

-- * Enrolls a student
-- * Issues a certificate
-- * Fails if certificate generation fails (rollback)

-- ```sql
-- BEGIN;
-- -- insert into enrollments
-- -- insert into certificates
-- -- COMMIT or ROLLBACK on error
-- ```

DO $$
DECLARE
    v_enrollment_id INT;
BEGIN
    -- start explicit transaction 
    -- BEGIN;

    -- Insert enrollment
    INSERT INTO enrollments (student_id, course_id)
    VALUES (4, 2)
    RETURNING enrollment_id INTO v_enrollment_id;

    -- Insert certificate
    INSERT INTO certificates (enrollment_id, serial_no)
    VALUES (
        v_enrollment_id,
        gen_random_uuid()
    );

    --  commit automatically happens at end of DO block
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback manually 
        RAISE NOTICE 'Error: %, rolling back...', SQLERRM;
        RAISE;
END;
$$;