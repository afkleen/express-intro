const express = require("express");
const app = express();
const port = 8080; // Du kan välja en annan port om du vill

var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "databas",
});
// Route för roten
app.get("/", (req, res) => {
  res.send("Hej från roten!");
});

// Route för /greet
app.get("/users", (req, res) => {
  //Paketet mysql är installerat med "npm install mysql"

  // Här skapas ett databaskopplings-objekt med inställningar för att ansluta till servern och databasen.

  // Här testas kopplingen till databasen.
  connection.connect(function (error) {
    // Den här funktionen är den callback som körs då uppkopplingen gjorts.
    if (error) throw error;
    console.log("Connection to DB created successfully.");
  });

  connection.query("SELECT * from users", function (error, results, fields) {
    if (error) throw error;
    console.log(fields);

    // Man kan loopa igenom fields och skriva ut namnen på kolumnerna.
    fields.forEach((field) => {
      console.log(field.name);
    });

    // inparametern results innehåller resultatet av din query. Om det är en SELECT är det en array med objekt, ett objekt för varje rad.
    console.log(results);
    results.forEach((element) => {});
  });

  const users = req.query.users;
});

// Starta servern
app.listen(port, () => {
  console.log(`Servern körs på http://localhost:${port}`);
});
