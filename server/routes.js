const express = require("express");
const router = express.Router();
const connectDB = require("./database");
const { ObjectId } = require("mongodb");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const handleError = (res, err) => {
  console.error(err);
  res.status(500).send({ error: err.message });
};

// Auth Routes
router.post("/auth/register", async (req, res) => {
    try {
        const db = await connectDB();
        const { username, password, email, role = "staff" } = req.body;

        const existingUser = await db.collection("Users").findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            role,
            createdAt: new Date()
        };

        await db.collection("Users").insertOne(newUser);
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        handleError(res, err);
    }
});

router.post("/auth/login", async (req, res) => {
    try {
        const db = await connectDB();
        const { username, password } = req.body;

        const user = await db.collection("Users").findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            "your-secret-key",
            { expiresIn: "1h" }
        );

        res.json({ 
            token, 
            role: user.role,
            username: user.username
        });
    } catch (err) {
        handleError(res, err);
    }
});

// Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, "your-secret-key");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        next();
    };
};

// Users Routes (Admin only)
router.get("/users", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const db = await connectDB();
        const users = await db.collection("Users").find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (err) {
        handleError(res, err);
    }
});

// Add new user
router.post("/users", authenticate, authorize(["admin"]), async (req, res) => {
  try {
      const db = await connectDB();
      const { username, password, email, role } = req.body;

      // Check if user already exists
      const existingUser = await db.collection("Users").findOne({ username });
      if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = {
          username,
          password: hashedPassword,
          email,
          role,
          createdAt: new Date()
      };

      const result = await db.collection("Users").insertOne(newUser);
      res.status(201).json({ 
          _id: result.insertedId,
          username,
          email,
          role
      });
  } catch (err) {
      handleError(res, err);
  }
});

// Add this route above your PUT route
router.get("/users/:id", authenticate, authorize(["admin"]), async (req, res) => {
  try {
      const db = await connectDB();
      const user = await db.collection("Users").findOne(
          { _id: new ObjectId(req.params.id) },
          { projection: { password: 0 } } // Exclude password from response
      );
      
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
  } catch (err) {
      handleError(res, err);
  }
});

// Update user
router.put("/users/:id", authenticate, authorize(["admin"]), async (req, res) => {
  try {
      const db = await connectDB();
      const { username, password, email, role } = req.body;

      // Validate input
      if (!username || !email || !role) {
          return res.status(400).json({ message: "All fields are required" });
      }

      const updateData = { username, email, role };
      
      // Only update password if provided
      if (password) {
          updateData.password = await bcrypt.hash(password, 10);
      }

      const result = await db.collection("Users").updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      
      // Return updated user data (without password)
      const updatedUser = await db.collection("Users").findOne(
          { _id: new ObjectId(req.params.id) },
          { projection: { password: 0 } }
      );
      
      res.json(updatedUser);
  } catch (err) {
      handleError(res, err);
  }
});

// Delete user
router.delete("/users/:id", authenticate, authorize(["admin"]), async (req, res) => {
  try {
      const db = await connectDB();
      const result = await db.collection("Users").deleteOne({ _id: new ObjectId(req.params.id) });
      
      if (result.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
  } catch (err) {
      handleError(res, err);
  }
});

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

router.put("/ingredients/:id", async (req, res) => {
  try {
      const db = await connectDB();
      const updateData = {};
      
      // Only handle direct updates here
      if (req.body.ingredient_name) updateData.ingredient_name = req.body.ingredient_name;
      if (req.body.unit_cost) updateData.unit_cost = req.body.unit_cost;
      if (req.body.available_quantity) updateData.available_quantity = req.body.available_quantity;
      if (req.body.unit_of_measure) updateData.unit_of_measure = req.body.unit_of_measure;

      const result = await db.collection("Ingredients").updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: updateData }
      );

      if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Ingredient not found" });
      }

      res.json(result);
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

// Add this route above your DELETE route
router.get("/purchases/:id", async (req, res) => {
  try {
      const db = await connectDB();
      const purchase = await db.collection("Purchases").findOne({ 
          _id: new ObjectId(req.params.id) 
      });
      
      if (!purchase) {
          return res.status(404).send({ error: "Purchase not found" });
      }
      
      res.json(purchase);
  } catch (err) {
      handleError(res, err);
  }
});

router.delete("/purchases/:id", async (req, res) => {
  try {
      const db = await connectDB();
      
      // 1. Get the purchase details first
      const purchase = await db.collection("Purchases").findOne({ 
          _id: new ObjectId(req.params.id) 
      });
      
      if (!purchase) {
          return res.status(404).send({ error: "Purchase not found" });
      }

      // 2. Delete the purchase
      const result = await db.collection("Purchases").deleteOne({ 
          _id: new ObjectId(req.params.id) 
      });

      if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Purchase not found" });
      }

      // 3. Subtract the quantity from ingredients (ONLY DO THIS IN BACKEND)
      await db.collection("Ingredients").updateOne(
          { _id: new ObjectId(purchase.ingredient_id) },
          { $inc: { available_quantity: -purchase.quantity } }
      );

      res.json({
          ...result,
          adjustedIngredientId: purchase.ingredient_id,
          adjustedQuantity: -purchase.quantity
      });
  } catch (err) {
      handleError(res, err);
  }
});

module.exports = router;