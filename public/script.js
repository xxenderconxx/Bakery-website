document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".sidebar button");
    const tabContents = document.querySelectorAll(".tab-content");

    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.dataset.tab;

            tabContents.forEach(content => content.classList.remove("active"));
            document.getElementById(targetTab).classList.add("active");

            // Load data for the selected tab
            if (targetTab === "ingredients") fetchIngredients();
            if (targetTab === "products") fetchProducts();
            if (targetTab === "orders") fetchOrders();
            if (targetTab === "customers") fetchCustomers();
        });
    });

    async function fetchIngredients() {
        const response = await fetch("/api/ingredients");
        const ingredients = await response.json();
        const tableBody = document.querySelector("#ingredients-table tbody");
        tableBody.innerHTML = "";
        ingredients.forEach(ingredient => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${ingredient.ingredient_name}</td>
                <td>${ingredient.unit_cost}</td>
                <td>${ingredient.available_quantity}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById("ingredient-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("ingredient-name").value;
        const cost = document.getElementById("ingredient-cost").value;
        const quantity = document.getElementById("ingredient-quantity").value;
    
        // Log the form data to verify input values
        console.log("Ingredient Form Data:", { name, cost, quantity });
    
        const response = await fetch("/api/ingredients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ingredient_name: name,
                unit_cost: parseFloat(cost),
                available_quantity: parseInt(quantity),
            }),
        });
    
        if (!response.ok) {
            console.error("Error adding ingredient:", await response.text());
        } else {
            console.log("Ingredient added successfully");
        }
    
        fetchIngredients();
    });
    

    async function fetchProducts() {
        const response = await fetch("/api/products");
        const products = await response.json();
        const tableBody = document.querySelector("#products-table tbody");
        tableBody.innerHTML = "";
        products.forEach(product => {
            const row = document.createElement("tr");
            const button = `<button onclick="fetchProductIngredients(${product.product_id})">View Ingredients</button>`;
            row.innerHTML = `
                <td>${product.product_name}</td>
                <td>${product.product_price}</td>
                <td>${button}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById("product-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("product-name").value;
        const price = document.getElementById("product-price").value;

        await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_name: name, product_price: parseFloat(price) })
        });

        fetchProducts();
    });

    async function fetchOrders() {
        const response = await fetch("/api/orders");
        const orders = await response.json();
        const tableBody = document.querySelector("#orders-table tbody");
        tableBody.innerHTML = "";
        orders.forEach(order => {
            const customerName = order.customer_info.customer_name; // Assumes lookup populates `customer_info`
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${customerName}</td>
                <td>${order.order_items.map(item => item.product_id).join(", ")}</td>
                <td>${order.order_status}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById("order-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const customerId = document.getElementById("order-customer-id").value;
        const productId = document.getElementById("order-product-id").value;
        const quantity = document.getElementById("order-quantity").value;
        const status = document.getElementById("order-status").value;

        await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer_id: parseInt(customerId), product_id: parseInt(productId), quantity: parseInt(quantity), order_status: status })
        });

        fetchOrders();
    });

    async function fetchCustomers() {
        const response = await fetch("/api/customers");
        const customers = await response.json();
        const tableBody = document.querySelector("#customers-table tbody");
        tableBody.innerHTML = "";
        customers.forEach(customer => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${customer.customer_name}</td>
                <td>${customer.customer_contact_number}</td>
                <td>${customer.customer_address}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById("customer-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("customer-name").value;
        const contact = document.getElementById("customer-contact").value;
        const address = document.getElementById("customer-address").value;

        await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer_name: name, customer_contact_number: contact, customer_address: address })
        });

        fetchCustomers();
    });

    document.querySelector('[data-tab="ingredients"]').click();
});

