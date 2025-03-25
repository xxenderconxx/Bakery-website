// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Add this line
const routes = require("./routes");

const app = express();
const PORT = 4000;

// Add CORS middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api", routes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});