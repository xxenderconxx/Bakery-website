const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api", routes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
