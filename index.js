import { createApp } from "./config.js";

// App erstellen und konfigurieren
const app = createApp({
  user: "lucalodom",
  host: "bbz.cloud",
  database: "lucalodom",
  password: "BVz=:d2[`Upr8{-c",
  port: 30211,
});

/* Startseite */
app.get("/", async (req, res) => {
  try {
    const result = await app.locals.pool.query("SELECT * FROM gallerie"); // Alle Bilder abrufen
    res.render("start", { bilder: result.rows }); // An die View übergeben
  } catch (err) {
    console.error("Fehler beim Abrufen der Bilder:", err);
    res.status(500).send("Fehler beim Abrufen der Bilder");
  }
});

/* Impressum */
app.get("/impressum", async function (req, res) {
  res.render("impressum", {});
});

/* Login-Seite */
app.get("/login", async function (req, res) {
  res.render("login", {});
});


app.get("/plus", async function (req, res) {
  res.render("plus", {}); // Rendert die plus.handlebars-Datei
});


/* Save-Seite */
app.get("/save", async function (req, res) {
  try {
    const user = req.session.user;

    if (!user) {
      console.log("Kein Benutzer eingeloggt. Weiterleitung zu /login.");
      res.redirect("/login");
      return;
    }

    const result = await app.locals.pool.query(
      `SELECT g.dateiname, g.hochgeladen_am, g.autor
       FROM save s
       JOIN gallerie g ON s.gallerie_id = g.id
       WHERE s.user_id = $1`,
      [user.id]
    );

    console.log("Abfrageergebnis:", result.rows);

    // Übergibt `username` und gespeicherte Bilder an die View
    res.render("save", {
      bilder: result.rows,
      username: user.username, // `username` aus der Session
    });
  } catch (err) {
    console.error("Fehler beim Abrufen der gespeicherten Bilder:", err);
    res.status(500).send("Fehler beim Abrufen der gespeicherten Bilder");
  }
});


/* Neue Route für das Hochladen von Dateien */
app.get("/new_post", async function (req, res) {
  res.render("new_post", {}); // Verweis auf das Formular
});

/* Server starten */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});
