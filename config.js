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

  const pool = new Pool(dbconfig);

  const login = new bbz307.Login("users", ["username", "passwort"], pool);
  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", "./views");

  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
      saveUninitialized: true,
      cookie: { maxAge: 86400000, secure: false },
      resave: false,
    })
  );

  app.get("/register", async function (req, res) {
    res.render("register", {});
  });

  app.get("/login", async function (req, res) {
    res.render("login", {});
  });

  app.get("/plus", async function (req, res) {
    res.render("plus", {});
  });

  app.post("/register", upload.none(), async (req, res) => {
    const user = await login.registerUser(req);
    if (user) {
      res.redirect("/save");
      return;
    } else {
      res.redirect("/register");
      return;
    }
  });

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login", upload.none(), async (req, res) => {
    const user = await login.loginUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/save");
      return;
    }
  });

  app.locals.pool = pool;

  return app;
}

export { upload };
