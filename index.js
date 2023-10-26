const express = require("express")
const path = require("path");

const port = 3000
const app = express()

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "public/views"));

app.use("/public", express.static(path.join(__dirname, "/public")));
app.get("/", (request, response) => {
    response.render("index");
});

app.listen(port, () => {
    console.log(`Сервер запущен. Адрес: http://127.0.0.1:${port}`)
})
