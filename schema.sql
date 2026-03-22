CREATE DATABASE academic_advisor;
USE academic_advisor;

-- =========================
-- 1. STUDENTS
-- =========================
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    major VARCHAR(100),
    minor VARCHAR(100),
    class_year INT,
    current_semester VARCHAR(20),
    max_credits_preference INT DEFAULT 16
);

-- =========================
-- 2. COURSES
-- General course catalog info
-- =========================
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(10) NOT NULL,
    course_number VARCHAR(20) NOT NULL,
    course_code VARCHAR(30) GENERATED ALWAYS AS (CONCAT(subject, ' ', course_number)) STORED,
    title VARCHAR(255) NOT NULL,
    unit_value DECIMAL(3,2),
    credits INT NOT NULL,
    description TEXT,
    department VARCHAR(100),
    UNIQUE(subject, course_number)
);

-- =========================
-- 3. COURSE SECTIONS
-- Semester-specific offerings
-- =========================
CREATE TABLE course_sections (
    section_id INT AUTO_INCREMENT PRIMARY KEY,
    crn INT NOT NULL UNIQUE,
    course_id INT NOT NULL,
    term VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    instruction_mode VARCHAR(100),
    days VARCHAR(10),
    start_time TIME,
    end_time TIME,
    additional_days VARCHAR(10),
    additional_time VARCHAR(50),
    seats_available INT,
    instructor VARCHAR(100),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON DELETE CASCADE
);

-- =========================
-- 4. PREREQUISITES
-- Which course is required before another
-- =========================
CREATE TABLE prerequisites (
    prereq_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    required_course_id INT NOT NULL,
    minimum_grade VARCHAR(5),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON DELETE CASCADE,
    FOREIGN KEY (required_course_id) REFERENCES courses(course_id)
        ON DELETE CASCADE,
    UNIQUE(course_id, required_course_id)
);

-- =========================
-- 5. STUDENT COURSE HISTORY
-- What students have taken / are taking
-- =========================
CREATE TABLE student_courses (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    section_id INT,
    course_id INT NOT NULL,
    semester_taken VARCHAR(20),
    year_taken INT,
    status ENUM('completed', 'in_progress', 'planned', 'dropped') NOT NULL,
    grade VARCHAR(5),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES course_sections(section_id)
        ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON DELETE CASCADE
);

-- =========================
-- 6. DEGREE REQUIREMENTS
-- Courses required for a major
-- =========================
CREATE TABLE degree_requirements (
    requirement_id INT AUTO_INCREMENT PRIMARY KEY,
    major VARCHAR(100) NOT NULL,
    course_id INT NOT NULL,
    category VARCHAR(100),
    required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON DELETE CASCADE
);