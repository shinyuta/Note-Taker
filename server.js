const express = require("express");
const fs = require("fs");

// uuid so that every note has a unique id, this makes it easier to sort through the database later.
const { v4: uuid4 } = require("uuid");
const path = require("path");
const app = express();
const db = require("./db/db.json");

// db path since we reference it a few times.
const dataBasePath = path.join(__dirname, "./db/db.json");
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// routes. Index on startup, others are links found in the html.
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

app.get("/api/notes", (req, res) => {
  res.json(db);
});

app.post("/api/notes", (req, res) => {
  // uses uuid4 for unique id.
  const noteNew = { ...req.body, id: uuid4() };
  db.push(noteNew);

  // writes to db.json (dataBasePath)
  fs.writeFile(dataBasePath, JSON.stringify(db, null, 2), (error) => {
    if (error) {
      return res.json({ error: "There was an error writing your note" });
    }
    return res.json(noteNew);
  });
});

app.delete("/api/notes/:id", (req, res) => {
    const selectNote = req.params.id

    // loops through
    for (let i = 0; i < db.length; i++) {
        if (selectNote === db[i].id) {
            db.splice(i, 1)
        }
    }

    // reads db file, finds id, updates json file based on deletion.
    fs.readFile("./db/db.json", (err, data) => {
    let entireNotes = JSON.parse(data);
    const editedNotes = entireNotes.filter(({ id }) => id !== req.params.id);
    console.log("notes updated");
    fs.writeFile(dataBasePath, JSON.stringify(editedNotes, null, 2), (err) => {
      if (err) {
        return res.json({ error: "Error writing to file" });
      }
    });
    res.json(db);
  });
});

// any unknown paths lead to index.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

// console logs link to localhost on npm start.
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);