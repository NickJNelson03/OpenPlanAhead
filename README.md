# OpenPlanAhead

OpenPlanAhead is a full-stack course search tool that allows users to explore course offerings by subject, course number, title, or instructor.

The system consists of a React frontend, a Flask backend API, and a MySQL database.

---

## Tech Stack

- Frontend: React (Vite)
- Backend: Flask (Python)
- Database: MySQL
- Data Processing: Pandas

---

## Project Structure

```

OpenPlanAhead/
├── client/                  # React frontend
├── server/                  # Flask backend
│   └── app.py
├── data/
│   ├── raw/
│   └── processed/           # contains fall_2026.csv
├── requirements.txt
├── .env                     # local config (not committed)
└── README.md

````

---

## Environment Setup

Python dependencies:

```bash
pip install -r requirements.txt
````

Frontend dependencies:

```bash
cd client
npm install
cd ..
```

Node version must be **20 or higher**.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=openplan
DB_PASSWORD=your_password_here
DB_NAME=academic_advisor

FLASK_ENV=development
FLASK_RUN_PORT=5000
```

The database credentials must match the MySQL user created locally.

---

## Database Setup

Start MySQL:

```bash
sudo service mysql start
sudo mysql
```

Create database:

```sql
CREATE DATABASE academic_advisor;
USE academic_advisor;
```

Create user:

```sql
CREATE USER 'openplan'@'localhost'
IDENTIFIED WITH mysql_native_password BY 'your_password_here';

GRANT ALL PRIVILEGES ON academic_advisor.* TO 'openplan'@'localhost';
FLUSH PRIVILEGES;
```

Create tables:

```sql
CREATE TABLE courses (...);
CREATE TABLE course_sections (...);
CREATE TABLE raw_courses (...);
```

(use schema defined in project)

---

## Data Loading

The cleaned dataset must exist at:

```
data/processed/fall_2026.csv
```

Move it into MySQL import directory:

```bash
sudo cp data/processed/fall_2026.csv /var/lib/mysql-files/
sudo chown mysql:mysql /var/lib/mysql-files/fall_2026.csv
sudo chmod 644 /var/lib/mysql-files/fall_2026.csv
```

Load into MySQL:

```sql
USE academic_advisor;

LOAD DATA INFILE '/var/lib/mysql-files/fall_2026.csv'
INTO TABLE raw_courses
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@term, @crn, @subject, @course_number, @title, @unit_value, @credits, @instruction_mode, @days, @start_time, @end_time, @additional_days, @additional_time, @seats_available, @instructor)
SET
    term = NULLIF(@term, ''),
    crn = NULLIF(@crn, ''),
    subject = NULLIF(@subject, ''),
    course_number = NULLIF(@course_number, ''),
    title = NULLIF(@title, ''),
    unit_value = NULLIF(@unit_value, ''),
    credits = NULLIF(@credits, ''),
    instruction_mode = NULLIF(@instruction_mode, ''),
    days = NULLIF(@days, ''),
    start_time = NULLIF(@start_time, ''),
    end_time = NULLIF(@end_time, ''),
    additional_days = NULLIF(@additional_days, ''),
    additional_time = NULLIF(@additional_time, ''),
    seats_available = NULLIF(@seats_available, ''),
    instructor = NULLIF(@instructor, '');
```

Populate tables:

```sql
INSERT INTO courses (...)
SELECT DISTINCT ...
FROM raw_courses
WHERE credits IS NOT NULL;

INSERT INTO course_sections (...)
SELECT ...
FROM raw_courses r
JOIN courses c ...
```

Verify:

```sql
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM course_sections;
```

---

## Running the App

Backend:

```bash
python server/app.py
```

Runs on:

```
http://localhost:5000
```

Test:

```
http://localhost:5000/search?q=MATH
```

Frontend:

```bash
cd client
npm run dev
```

Runs on:

```
http://localhost:5173
```

---

## Usage

Search examples:

* `MATH`
* `Calculus`
* `222`
* `Skon`

---

## Important Notes

* Backend must be running for frontend to work
* If backend is not running, frontend will show `Failed to fetch`
* Database must be populated before searching
* Time formatting uses `%H:%i` in SQL

---

## Common Issues

**ERR_CONNECTION_REFUSED**
→ Backend not running

**No courses found**
→ Database is empty or insert step not completed

**Authentication plugin error**
→ Use `mysql_native_password` when creating MySQL user

**Node errors**
→ Upgrade Node to version 20+

---
