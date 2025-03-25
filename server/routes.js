const express = require("express");
const router = express.Router();
const connectDB = require("./database");
const { ObjectId } = require("mongodb");

const handleError = (res, err) => {
  console.error(err);
  res.status(500).send({ error: err.message });
};

// Ingredients Routes
router.get("/ingredients", async (req, res) => {
  try {
    const db = await connectDB();
    const ingredients = await db.collection("Ingredients").find().toArray();
    res.json(ingredients);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/ingredients/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const ingredient = await db.collection("Ingredients").findOne({ _id: new ObjectId(req.params.id) });
    if (!ingredient) return res.status(404).send({ error: "Ingredient not found" });
    res.json(ingredient);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/ingredients", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Ingredients").insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/ingredients/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Ingredients").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).send({ error: "Ingredient not found" });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/ingredients/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Ingredients").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send({ error: "Ingredient not found" });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

// Products Routes
router.get("/products", async (req, res) => {
  try {
    const db = await connectDB();
    const products = await db.collection("Products").find().toArray();
    res.json(products);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const product = await db.collection("Products").findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).send({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/products", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Products").insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Products").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).send({ error: "Product not found" });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Products").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send({ error: "Product not found" });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

// Customers Routes
router.get("/customers", async (req, res) => {
  try {
    const db = await connectDB();
    const customers = await db.collection("Customers").find().toArray();
    res.json(customers);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const customer = await db.collection("Customers").findOne({ _id: new ObjectId(req.params.id) });
    if (!customer) return res.status(404).send({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/customers", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Customers").insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/customers/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Customers").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).send({ error: "Customer not found" });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Customers").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send({ error: "Customer not found" });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

// Orders Routes
router.get("/orders", async (req, res) => {
  try {
    const db = await connectDB();
    const orders = await db.collection("Orders").aggregate([
      {
        $lookup: {
          from: "Customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_info"
        }
      },
      { $unwind: "$customer_info" },
      {
        $lookup: {
          from: "Order_Items",
          localField: "_id",
          foreignField: "order_id",
          as: "order_items",
          pipeline: [
            {
              $lookup: {
                from: "Products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_info"
              }
            },
            { $unwind: "$product_info" }
          ]
        }
      }
    ]).toArray();
    res.json(orders);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const order = await db.collection("Orders").aggregate([
      { $match: { _id: new ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "Customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_info"
        }
      },
      { $unwind: "$customer_info" },
      {
        $lookup: {
          from: "Order_Items",
          localField: "_id",
          foreignField: "order_id",
          as: "order_items",
          pipeline: [
            {
              $lookup: {
                from: "Products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_info"
              }
            },
            { $unwind: "$product_info" }
          ]
        }
      }
    ]).next();

    if (!order) return res.status(404).send({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/orders", async (req, res) => {
  try {
    const db = await connectDB();
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    // Get product prices and calculate total
    for (const item of req.body.order_items) {
      const product = await db.collection("Products").findOne({ _id: new ObjectId(item.product_id) });
      if (!product) {
        return res.status(400).send({ error: `Product not found: ${item.product_id}` });
      }
      
      const itemTotal = product.product_price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product_id: new ObjectId(item.product_id),
        quantity: item.quantity,
        unit_price: product.product_price
      });
    }

    const orderData = {
      customer_id: new ObjectId(req.body.customer_id),
      order_date: new Date(),
      order_status: req.body.order_status || "Pending",
      total_amount: totalAmount
    };

    // Insert order
    const orderResult = await db.collection("Orders").insertOne(orderData);
    
    // Insert order items with order reference
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderResult.insertedId
    }));
    
    await db.collection("Order_Items").insertMany(itemsWithOrderId);

    // Get the full order with joined data
    const newOrder = await db.collection("Orders").aggregate([
      { $match: { _id: orderResult.insertedId } },
      {
        $lookup: {
          from: "Customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_info"
        }
      },
      { $unwind: "$customer_info" },
      {
        $lookup: {
          from: "Order_Items",
          localField: "_id",
          foreignField: "order_id",
          as: "order_items",
          pipeline: [
            {
              $lookup: {
                from: "Products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_info"
              }
            },
            { $unwind: "$product_info" }
          ]
        }
      }
    ]).next();

    res.status(201).json(newOrder);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const db = await connectDB();
    
    // Calculate total amount from order items
    let totalAmount = 0;
    const orderItems = [];
    
    // Get product prices and calculate total
    for (const item of req.body.order_items) {
      const product = await db.collection("Products").findOne({ 
        _id: new ObjectId(item.product_id) 
      });
      if (!product) {
        return res.status(400).send({ error: `Product not found: ${item.product_id}` });
      }
      
      const itemTotal = product.product_price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product_id: new ObjectId(item.product_id),
        quantity: item.quantity,
        unit_price: product.product_price
      });
    }

    // Update order
    const orderData = {
      customer_id: new ObjectId(req.body.customer_id),
      order_status: req.body.order_status,
      total_amount: totalAmount,
      order_date: new Date() // Update the order date to now
    };

    const result = await db.collection("Orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: orderData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).send({ error: "Order not found" });
    }
    
    // Delete existing order items
    await db.collection("Order_Items").deleteMany({ 
      order_id: new ObjectId(req.params.id) 
    });
    
    // Insert new order items with order reference
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: new ObjectId(req.params.id)
    }));
    
    await db.collection("Order_Items").insertMany(itemsWithOrderId);
    
    // Get the updated order with joined data
    const updatedOrder = await db.collection("Orders").aggregate([
      { $match: { _id: new ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "Customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_info"
        }
      },
      { $unwind: "$customer_info" },
      {
        $lookup: {
          from: "Order_Items",
          localField: "_id",
          foreignField: "order_id",
          as: "order_items",
          pipeline: [
            {
              $lookup: {
                from: "Products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_info"
              }
            },
            { $unwind: "$product_info" }
          ]
        }
      }
    ]).next();

    res.json(updatedOrder);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    const db = await connectDB();
    // Delete order items first
    await db.collection("Order_Items").deleteMany({ order_id: new ObjectId(req.params.id) });
    // Then delete the order
    const result = await db.collection("Orders").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send({ error: "Order not found" });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

// Purchases Routes
router.get("/purchases", async (req, res) => {
  try {
    const db = await connectDB();
    const purchases = await db.collection("Purchases").aggregate([
      {
        $lookup: {
          from: "Ingredients",
          localField: "ingredient_id",
          foreignField: "_id",
          as: "ingredient_info"
        }
      },
      { $unwind: "$ingredient_info" }
    ]).toArray();
    res.json(purchases);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/purchases", async (req, res) => {
  try {
    const db = await connectDB();
    const purchaseData = {
      ...req.body,
      ingredient_id: new ObjectId(req.body.ingredient_id),
      purchase_date: new Date(req.body.purchase_date)
    };
    const result = await db.collection("Purchases").insertOne(purchaseData);
    
    // Update ingredient quantity
    await db.collection("Ingredients").updateOne(
      { _id: new ObjectId(req.body.ingredient_id) },
      { $inc: { available_quantity: parseInt(req.body.quantity) } }
    );
    
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/purchases/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Purchases").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send({ error: "Purchase not found" });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;