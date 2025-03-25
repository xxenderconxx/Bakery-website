const { MongoClient, ObjectId } = require("mongodb");

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
        await db.collection("Order_Items").drop().catch(() => {});
        await db.collection("Purchases").drop().catch(() => {});
        await db.collection("Users").drop().catch(() => {});

        // Create collections and insert sample data with consistent _id fields

        // Ingredients
        const ingredients = await db.collection("Ingredients").insertMany([
            { _id: new ObjectId(), ingredient_name: "Flour", unit_cost: 0.5, available_quantity: 100, unit_of_measure: "kg" },
            { _id: new ObjectId(), ingredient_name: "Sugar", unit_cost: 0.3, available_quantity: 50, unit_of_measure: "kg" },
            { _id: new ObjectId(), ingredient_name: "Butter", unit_cost: 1.0, available_quantity: 20, unit_of_measure: "kg" },
            { _id: new ObjectId(), ingredient_name: "Eggs", unit_cost: 0.2, available_quantity: 100, unit_of_measure: "pieces" },
            { _id: new ObjectId(), ingredient_name: "Milk", unit_cost: 0.8, available_quantity: 30, unit_of_measure: "liters" }
        ]);
        const ingredientIds = ingredients.insertedIds;

        // Products
        const products = await db.collection("Products").insertMany([
            { _id: new ObjectId(), product_name: "Chocolate Cake", product_price: 15.0, description: "Delicious chocolate cake" },
            { _id: new ObjectId(), product_name: "Whole Wheat Bread", product_price: 5.0, description: "Healthy whole wheat bread" },
            { _id: new ObjectId(), product_name: "Chocolate Chip Cookie", product_price: 2.0, description: "Classic chocolate chip cookies" },
            { _id: new ObjectId(), product_name: "Croissant", product_price: 3.5, description: "Flaky French croissant" },
            { _id: new ObjectId(), product_name: "Blueberry Muffin", product_price: 2.5, description: "Moist blueberry muffin" }
        ]);
        const productIds = products.insertedIds;

        // Product Ingredients
        await db.collection("Product_Ingredients").insertMany([
            { _id: new ObjectId(), product_id: productIds[0], ingredient_id: ingredientIds[0], quantity_per_product: 2.0 }, // Cake uses Flour
            { _id: new ObjectId(), product_id: productIds[0], ingredient_id: ingredientIds[1], quantity_per_product: 1.0 }, // Cake uses Sugar
            { _id: new ObjectId(), product_id: productIds[0], ingredient_id: ingredientIds[2], quantity_per_product: 0.5 }, // Cake uses Butter
            { _id: new ObjectId(), product_id: productIds[0], ingredient_id: ingredientIds[3], quantity_per_product: 3 },   // Cake uses Eggs
            { _id: new ObjectId(), product_id: productIds[1], ingredient_id: ingredientIds[0], quantity_per_product: 1.5 }, // Bread uses Flour
            { _id: new ObjectId(), product_id: productIds[1], ingredient_id: ingredientIds[2], quantity_per_product: 0.5 }, // Bread uses Butter
            { _id: new ObjectId(), product_id: productIds[1], ingredient_id: ingredientIds[4], quantity_per_product: 0.3 }, // Bread uses Milk
            { _id: new ObjectId(), product_id: productIds[2], ingredient_id: ingredientIds[0], quantity_per_product: 0.5 }, // Cookie uses Flour
            { _id: new ObjectId(), product_id: productIds[2], ingredient_id: ingredientIds[1], quantity_per_product: 0.2 }, // Cookie uses Sugar
            { _id: new ObjectId(), product_id: productIds[2], ingredient_id: ingredientIds[2], quantity_per_product: 0.3 }, // Cookie uses Butter
            { _id: new ObjectId(), product_id: productIds[2], ingredient_id: ingredientIds[3], quantity_per_product: 1 },   // Cookie uses Egg
            { _id: new ObjectId(), product_id: productIds[3], ingredient_id: ingredientIds[0], quantity_per_product: 0.8 }, // Croissant uses Flour
            { _id: new ObjectId(), product_id: productIds[3], ingredient_id: ingredientIds[2], quantity_per_product: 0.7 }, // Croissant uses Butter
            { _id: new ObjectId(), product_id: productIds[3], ingredient_id: ingredientIds[4], quantity_per_product: 0.2 }, // Croissant uses Milk
            { _id: new ObjectId(), product_id: productIds[4], ingredient_id: ingredientIds[0], quantity_per_product: 0.6 }, // Muffin uses Flour
            { _id: new ObjectId(), product_id: productIds[4], ingredient_id: ingredientIds[1], quantity_per_product: 0.4 }, // Muffin uses Sugar
            { _id: new ObjectId(), product_id: productIds[4], ingredient_id: ingredientIds[3], quantity_per_product: 1 },   // Muffin uses Egg
            { _id: new ObjectId(), product_id: productIds[4], ingredient_id: ingredientIds[4], quantity_per_product: 0.3 }  // Muffin uses Milk
        ]);

        // Customers
        const customers = await db.collection("Customers").insertMany([
            { _id: new ObjectId(), customer_name: "John Doe", customer_contact_number: "1234567890", customer_address: "123 Main St", email: "john@example.com" },
            { _id: new ObjectId(), customer_name: "Jane Smith", customer_contact_number: "0987654321", customer_address: "456 Elm St", email: "jane@example.com" },
            { _id: new ObjectId(), customer_name: "Bob Johnson", customer_contact_number: "5551234567", customer_address: "789 Oak St", email: "bob@example.com" }
        ]);
        const customerIds = customers.insertedIds;

        // Orders
        const orders = await db.collection("Orders").insertMany([
            { _id: new ObjectId(), customer_id: customerIds[0], order_date: new Date("2023-10-01"), order_status: "Completed", total_amount: 30.0 },
            { _id: new ObjectId(), customer_id: customerIds[1], order_date: new Date("2023-10-02"), order_status: "Pending", total_amount: 5.0 },
            { _id: new ObjectId(), customer_id: customerIds[0], order_date: new Date("2023-10-03"), order_status: "Completed", total_amount: 10.0 },
            { _id: new ObjectId(), customer_id: customerIds[2], order_date: new Date("2023-10-04"), order_status: "Processing", total_amount: 12.5 }
        ]);
        const orderIds = orders.insertedIds;

        // Order Items
        await db.collection("Order_Items").insertMany([
            { _id: new ObjectId(), order_id: orderIds[0], product_id: productIds[0], quantity: 2, unit_price: 15.0 },
            { _id: new ObjectId(), order_id: orderIds[1], product_id: productIds[1], quantity: 1, unit_price: 5.0 },
            { _id: new ObjectId(), order_id: orderIds[2], product_id: productIds[2], quantity: 5, unit_price: 2.0 },
            { _id: new ObjectId(), order_id: orderIds[3], product_id: productIds[3], quantity: 2, unit_price: 3.5 },
            { _id: new ObjectId(), order_id: orderIds[3], product_id: productIds[4], quantity: 2, unit_price: 2.5 }
        ]);

        // Purchases
        await db.collection("Purchases").insertMany([
            { _id: new ObjectId(), ingredient_id: ingredientIds[0], purchase_date: new Date("2023-09-01"), quantity: 50, unit_cost: 0.45, supplier: "Flour Co" },
            { _id: new ObjectId(), ingredient_id: ingredientIds[1], purchase_date: new Date("2023-09-05"), quantity: 30, unit_cost: 0.28, supplier: "Sugar Inc" },
            { _id: new ObjectId(), ingredient_id: ingredientIds[2], purchase_date: new Date("2023-09-10"), quantity: 15, unit_cost: 0.95, supplier: "Dairy Farms" },
            { _id: new ObjectId(), ingredient_id: ingredientIds[3], purchase_date: new Date("2023-09-15"), quantity: 60, unit_cost: 0.18, supplier: "Eggs R Us" },
            { _id: new ObjectId(), ingredient_id: ingredientIds[4], purchase_date: new Date("2023-09-20"), quantity: 20, unit_cost: 0.75, supplier: "Milk Direct" }
        ]);

        // Users (for authentication)
        await db.collection("Users").insertMany([
            { _id: new ObjectId(), username: "admin", password: "hashed_password", role: "admin", email: "admin@bakery.com" },
            { _id: new ObjectId(), username: "staff", password: "hashed_password", role: "staff", email: "staff@bakery.com" }
        ]);

        console.log("Database initialized successfully with consistent relationships!");
    } catch (err) {
        console.error("Failed to initialize database:", err);
    } finally {
        await client.close();
    }
}

initializeDatabase();