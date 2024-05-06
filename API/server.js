const express = require("express");
const app = express();
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

// parse application/json, för att hantera att man POSTar med JSON
const bodyParser = require("body-parser");

// Inställningar av servern.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function getDBConnnection() {
  // Här skapas ett databaskopplings-objekt med inställningar för att ansluta till servern och databasen.
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "databas",
  });
}

app.get("/", (req, res) => {
  res.send(`<h1>Doumentation EXEMPEL</h1>
  <ul><li> GET /users</li></ul>`);
});

app.get("/users", async function (req, res) {
  let connection = await getDBConnnection();
  let sql = `SELECT * from users`;
  let [results] = await connection.execute(sql);

  //res.json() skickar resultat som JSON till klienten
  res.json(results);
});

app.post("/users", async function (req, res) {
  //req.body innehåller det postade datat
  console.log(req.body);

  let connection = await getDBConnnection();
  let sql = `INSERT INTO users (username, name, password)
     VALUES (?, ?, ?)`;

  let [results] = await connection.execute(sql, [
    req.body.username,
    req.body.name,
    req.body.password,
  ]);

  //results innehåller metadata om vad som skapades i databasen
  console.log(results);
  res.json(results);
});

/*
  app.post() hanterar en http request med POST-metoden.
*/
app.post("/users", function (req, res) {
  // Data som postats till routen ligger i body-attributet på request-objektet.
  console.log(req.body);

  // POST ska skapa något så här kommer det behövas en INSERT
  let sql = `INSERT INTO ...`;
});

app.post("/users/login", async function (req, res) {
  //Denna kod skapar en token att returnera till anroparen
  let connection = await getDBConnnection();

  let sql = `SELECT * FROM users
  WHERE username = ?`;

  let [results] = await connection.execute(sql, [req.body.username]);

  let user = results[0];
  let hashedPassword = user.password;

  let isPasswordCorrect = await bcrypt.compare(
    req.body.password,
    hashedPassword
  );

  if (isPasswordCorrect) {
    // Skicka info om användaren, utan känslig info som t.ex. hash
  } else {
    // Skicka felmeddelande
    res.status(400).json({ error: "Invalid credentials" });
  }

  // if(req.body.username){};

  let payload = {
    sub: req.body.id, // sub är obligatorisk
    name: req.body.username,
  };
  let token = jwt.sign(payload, "secrets");
  res.send(token);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

app.put("/users/:id", async function (req, res) {
  //kod här för att hantera anrop…
  let sql = `UPDATE users
      SET username = ?, name = ?, password = ?, email = ?
      WHERE id = ?`;
  let connection = await getDBConnnection();
  const salt = await bcrypt.genSalt(10); // genererar ett salt till hashning
  const hashedPassword = await bcrypt.hash(req.body.password, salt); //hashar lösenordet

  let [results] = await connection.execute(sql, [
    req.body.username,
    req.body.name,
    hashedPassword,
    req.body.email,
    req.params.id,
  ]);
  //kod här för att returnera data
  console.log(results);
  res.json(results);
});

const bcrypt = require("bcrypt");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const salt = await bcrypt.genSalt(10); // genererar ett salt till hashning
  const hashedPassword = await bcrypt.hash(password, salt); //hashar lösenordet
};
let authHeader = req.headers["authorization"];
if (authHeader === undefined) {
  return res.status(401).send("Authorization header is missing");
}

let token = authHeader.slice(7);

let decoded;
try {
  decoded = jwt.verify(token, "din superhemliga secret");
} catch (err) {
  console.log(err);
  return res.status(401).send("Invalid auth token");
}

req.user = decoded;

res.send(`Välkommen ${req.user.name}, du är nu autentiserad!`);

//Route för att testa token.
app.get("/auth-test", function (req, res) {
  let authHeader = req.headers["authorization"]; //Hämtar värdet (en sträng med token) från authorization headern i requesten

  if (authHeader === undefined) {
    res.status(401).send("Auth token missing.");
  }

  let token = authHeader.slice(7); // Tar bort "BEARER " som står i början på strängen.
  console.log("token: ", token);

  let decoded;
  try {
    // Verifiera att detta är en korrekt token. Den ska vara:
    // * skapad med samma secret
    // * omodifierad
    // * fortfarande giltig
    decoded = jwt.verify(token, THESECRET);
  } catch (err) {
    // Om något är fel med token så kastas ett error.

    console.error(err); //Logga felet, för felsökning på servern.

    res.status(401).send("Invalid auth token");
  }

  res.send(decoded); // Skickar tillbaka den avkodade, giltiga, tokenen.
});
