const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://CS203:Rex@xxenderconxx.lheqq.mongodb.net/?retryWrites=true&w=majority&appName=xxENDERCONxx";
const client = new MongoClient(uri);

const dbName = "BakeryDataBase";

async function initializeDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const db = client.db(dbName);

        // Drop existing collections to start fresh
        await db.collection("Ingredients").drop().catch(() => {});
        await db.collection("Products").drop().catch(() => {});
        await db.collection("Product_Ingredients").drop().catch(() => {});
        await db.collection("Customers").drop().catch(() => {});
        await db.collection("Orders").drop().catch(() => {});

        // Create collections and insert sample data

        // Ingredients
        await db.collection("Ingredients").insertMany([
            { ingredient_id: 1, ingredient_name: "Flour", unit_cost: 0.5, available_quantity: 100 },
            { ingredient_id: 2, ingredient_name: "Sugar", unit_cost: 0.3, available_quantity: 50 },
            { ingredient_id: 3, ingredient_name: "Butter", unit_cost: 1.0, available_quantity: 20 }
        ]);

        // Products
        await db.collection("Products").insertMany([
            { product_id: 1, product_name: "Cake", product_price: 15.0 },
            { product_id: 2, product_name: "Bread", product_price: 5.0 },
            { product_id: 3, product_name: "Cookie", product_price: 2.0 }
        ]);

        // Product Ingredients
        await db.collection("Product_Ingredients").insertMany([
            { product_id: 1, ingredient_id: 1, quantity_per_product: 2.0, unit_of_measure: "kg" }, // Cake uses Flour
            { product_id: 1, ingredient_id: 2, quantity_per_product: 1.0, unit_of_measure: "kg" }, // Cake uses Sugar
            { product_id: 1, ingredient_id: 3, quantity_per_product: 0.5, unit_of_measure: "kg" }, // Cake uses Butter
            { product_id: 2, ingredient_id: 1, quantity_per_product: 1.5, unit_of_measure: "kg" }, // Bread uses Flour
            { product_id: 2, ingredient_id: 3, quantity_per_product: 0.5, unit_of_measure: "kg" }, // Bread uses Butter
            { product_id: 3, ingredient_id: 1, quantity_per_product: 0.5, unit_of_measure: "kg" }, // Cookie uses Flour
            { product_id: 3, ingredient_id: 2, quantity_per_product: 0.2, unit_of_measure: "kg" }  // Cookie uses Sugar
        ]);

        // Customers
        await db.collection("Customers").insertMany([
            { customer_id: 1, customer_name: "John Doe", customer_contact_number: "1234567890", customer_address: "123 Main St" },
            { customer_id: 2, customer_name: "Jane Smith", customer_contact_number: "0987654321", customer_address: "456 Elm St" }
        ]);

        // Orders
        await db.collection("Orders").insertMany([
            { order_id: 1, customer_id: 1, order_items: [{ product_id: 1, quantity: 2 }], order_date: new Date("2023-10-01"), order_status: "Completed" },
            { order_id: 2, customer_id: 2, order_items: [{ product_id: 2, quantity: 1 }], order_date: new Date("2023-10-02"), order_status: "Pending" },
            { order_id: 3, customer_id: 1, order_items: [{ product_id: 3, quantity: 5 }], order_date: new Date("2023-10-03"), order_status: "Completed" }
        ]);

        console.log("Database initialized successfully following the ERD structure!");
    } catch (err) {
        console.error("Failed to initialize database:", err);
    } finally {
        await client.close();
    }
}

initializeDatabase();
