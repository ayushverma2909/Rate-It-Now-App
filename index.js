import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";


const app = express();
const port = 3000;


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Your Database",
  password: "Your database password",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books");
    const books = result.rows;
    res.render("index.ejs", { books: books, book: null });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  const { bookTitle, dateRead, rating, notes } = req.body;

  try {
    const response = await axios.get(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitle)}`
    );
    const bookData = response.data.docs[0];

    if (!bookData) {
      return res.render("index.ejs", { books: [], book: null });
    }

    const title = bookData.title || "Unknown";
    const author = bookData.author_name ? bookData.author_name.join(", ") : "Unknown";
    const cover_url = bookData.cover_i
      ? `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg`
      : null;

    await db.query(
      "INSERT INTO books (title, author, date_read, rating, notes, cover_url) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, dateRead, rating, notes, cover_url]
    );

    res.redirect("/");
  } catch (err) {
    console.error("Error adding book:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/")
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
