import { createApp, upload } from "./config.js"; // Upload-Funktion hinzugefügt

const app = createApp({
  user: "lucalodom",
  host: "bbz.cloud",
  database: "lucalodom",
  password: "BVz=:d2[`Upr8{-c",
  port: 30211,
});

/* Startseite */
app.get("/", async (req, res) => {
  const result = await app.locals.pool.query("SELECT * FROM gallerie"); // Alle Bilder abrufen
  res.render("start", { bilder: result.rows }); // An die View übergeben
});


app.get("/impressum", async function (req, res) {
  res.render("impressum", {});
});

app.get("/login", async function (req, res) {
  res.render("login", {});
});

app.get("/save", async function (req, res) {
  res.render("save", {});
});

// Neue Route für das Hochladen von Dateien
app.get("/new_post", async function (req, res) {
  res.render("new_post", {}); // Verweis auf das Formular
});

app.post("/create_post", upload.single('image'), async function (req, res) {
  await app.locals.pool.query(
    "INSERT INTO todos (text, dateiname) VALUES ($1, $2)",
    [req.body.text, req.file.filename]
  );
  res.redirect("/"); // Nach dem Hochladen auf die Startseite zurück
});

/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});


app.post("/upload", upload.single("image"), async (req, res) => {
  const { titel, beschreibung } = req.body; // Titel und Beschreibung aus dem Formular
  const dateiname = req.file.filename; // Dateiname des hochgeladenen Bildes

  // Daten in die Datenbank speichern
  await app.locals.pool.query(
    "INSERT INTO gallerie (dateiname, titel, beschreibung) VALUES ($1, $2, $3)",
    [dateiname, titel, beschreibung]
  );

  res.redirect("/"); // Zurück zur Startseite
});