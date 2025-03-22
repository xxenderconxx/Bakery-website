const express = require("express");
const router = express.Router();
const connectDB = require("./database");

const handleError = (res, err) => res.status(500).send({ error: err.message });

// Ingredients Routes
router.get("/ingredients", async (req, res) => {
    const db = await connectDB();
    try {
        const ingredients = await db.collection("Ingredients").find().toArray();
        res.json(ingredients);
    } catch (err) {
        handleError(res, err);
    }
});

router.post("/ingredients", async (req, res) => {
    const db = await connectDB();
    try {
        const result = await db.collection("Ingredients").insertOne(req.body);
        res.json(result);
    } catch (err) {
        handleError(res, err);
    }
});

// Products Routes
router.get("/products", async (req, res) => {
    const db = await connectDB();
    try {
        const products = await db.collection("Products").find().toArray();
        res.json(products);
    } catch (err) {
        handleError(res, err);
    }
});

router.post("/products", async (req, res) => {
    const db = await connectDB();
    try {
        const result = await db.collection("Products").insertOne(req.body);
        res.json(result);
    } catch (err) {
        handleError(res, err);
    }
});

// Product Ingredients Routes
router.get("/product_ingredients/:id", async (req, res) => {
    const db = await connectDB();
    try {
        const productId = parseInt(req.params.id);
        const productIngredients = await db.collection("Product_Ingredients").find({ product_id: productId }).toArray();
        const ingredients = await Promise.all(
            productIngredients.map(async (pi) => {
                const ingredient = await db.collection("Ingredients").findOne({ ingredient_id: pi.ingredient_id });
                return { ...ingredient, quantity_per_product: pi.quantity_per_product, unit_of_measure: pi.unit_of_measure };
            })
        );
        res.json(ingredients);
    } catch (err) {
        handleError(res, err);
    }
});

// Orders Routes
router.get("/orders", async (req, res) => {
    const db = await connectDB();
    try {
        const orders = await db.collection("Orders").aggregate([
            {
                $lookup: {
                    from: "Customers",
                    localField: "customer_id",
                    foreignField: "customer_id",
                    as: "customer_info"
                }
            },
            {
                $unwind: "$customer_info"
            }
        ]).toArray();
        res.json(orders);
    } catch (err) {
        handleError(res, err);
    }
});

router.post("/orders", async (req, res) => {
    const db = await connectDB();
    try {
        const result = await db.collection("Orders").insertOne(req.body);
        res.json(result);
    } catch (err) {
        handleError(res, err);
    }
});

// Customers Routes
router.get("/customers", async (req, res) => {
    const db = await connectDB();
    try {
        const customers = await db.collection("Customers").find().toArray();
        res.json(customers);
    } catch (err) {
        handleError(res, err);
    }
});

router.post("/customers", async (req, res) => {
    const db = await connectDB();
    try {
        const result = await db.collection("Customers").insertOne(req.body);
        res.json(result);
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
