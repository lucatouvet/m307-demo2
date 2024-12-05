import express from "express";
import { engine } from "express-handlebars";
import pg from "pg";
const { Pool } = pg;
import cookieParser from "cookie-parser";
import multer from "multer";
const upload = multer({ dest: "public/uploads/" });
import sessions from "express-session";
import bbz307 from "bbz307";

export function createApp(dbconfig) {
  const app = express();

  // PostgreSQL-Pool initialisieren
  const pool = new Pool(dbconfig);

  // Login-Instanz aus bbz307
  const login = new bbz307.Login("users", ["username", "passwort"], pool);

  // View-Engine konfigurieren
  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", "./views");

  // Middleware hinzufügen
  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
      saveUninitialized: true,
      resave: false,
      cookie: { maxAge: 86400000, secure: false },
    })
  );

  // Pool global verfügbar machen
  app.locals.pool = pool;

  // Login-Route
  app.post("/login", upload.none(), async (req, res) => {
    try {
      const user = await login.loginUser(req); // Benutzeranmeldung
      console.log("Login-Ergebnis:", user);

      if (!user) {
        console.log("Kein Benutzer gefunden. Weiterleitung zu /login.");
        res.redirect("/login");
        return;
      }

      // Benutzer in der Session speichern
      req.session.user = user;
      console.log("Session gesetzt:", req.session.user);

      res.redirect("/save");
    } catch (err) {
      console.error("Fehler in /login:", err);
      res.status(500).send("Interner Serverfehler");
    }
  });

  // Registrierung
  app.post("/register", upload.none(), async (req, res) => {
    const user = await login.registerUser(req);
    if (user) {
      res.redirect("/save");
    } else {
      res.redirect("/register");
    }
  });

  // Datei-Upload
  app.post("/upload", upload.single("dateiname"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("Keine Datei hochgeladen!");
    }

    const user = req.session.user;
    if (!user) {
      console.log("Benutzer nicht eingeloggt. Weiterleitung zu /login.");
      res.redirect("/login");
      return;
    }

    const date = new Date();
    await pool.query(
      "INSERT INTO gallerie (dateiname, hochgeladen_am, autor) VALUES ($1, $2, $3)",
      [req.file.filename, date, user.id]
    );
    res.redirect("/");
  });

  // Galerie speichern
  app.post("/save/:id", async (req, res) => {
    try {
      const user = req.session.user;
      if (!user) {
        console.log("Kein Benutzer eingeloggt. Weiterleitung zu /login.");
        res.redirect("/login");
        return;
      }

      const galerieExists = await pool.query(
        "SELECT * FROM gallerie WHERE id = $1",
        [req.params.id]
      );

      if (galerieExists.rows.length === 0) {
        console.log("Galerie nicht gefunden:", req.params.id);
        res.status(404).send("Galerie nicht gefunden");
        return;
      }

      await pool.query(
        "INSERT INTO save (gallerie_id, user_id) VALUES ($1, $2)",
        [req.params.id, user.id]
      );

      console.log("Speichern erfolgreich:", req.params.id);
      res.redirect("/");
    } catch (err) {
      console.error("Fehler in /save/:id:", err);
      res.status(500).send("Interner Serverfehler");
    }
  });

  return app;
}

// Exportiere `upload`, um es in anderen Dateien zu verwenden
export { upload };
