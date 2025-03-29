const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://CS203:Rex@xxenderconxx.lheqq.mongodb.net/?retryWrites=true&w=majority&appName=xxENDERCONxx";
const client = new MongoClient(uri);
const dbName = "BakeryDataBase";

async function connectDB() {
    try {
        if (!client.isConnected) {
            await client.connect();
        }
        console.log("Connected to MongoDB Atlas");
        return client.db(dbName);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = connectDB;
