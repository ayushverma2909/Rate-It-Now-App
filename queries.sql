CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT,
  author TEXT,
  rating INTEGER,
  review TEXT,
  read_date DATE,
  cover_url TEXT
);
