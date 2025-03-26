document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Display username and role
    const userRole = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    document.getElementById("username-display").textContent = `Logged in as ${username} (${userRole})`;

    // Show admin tabs if user is admin
    if (userRole === "admin") {
        document.getElementById("users-tab").style.display = "block";
    }

    // Logout button
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("username");
        window.location.href = "login.html";
    });

    const tabButtons = document.querySelectorAll(".sidebar button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.dataset.tab;
            tabContents.forEach(content => content.classList.remove("active"));
            document.getElementById(targetTab).classList.add("active");

            if (targetTab === "ingredients") fetchIngredients();
            if (targetTab === "products") fetchProducts();
            if (targetTab === "orders") {
                fetchOrders();
                populateCustomerDropdown();
                populateProductDropdown();
            }
            if (targetTab === "customers") fetchCustomers();
            if (targetTab === "purchases") {
                fetchPurchases();
                populatePurchaseIngredientDropdown();
            }
            if (targetTab === "users") fetchUsers();
        });
    });

    // Initialize with Ingredients tab
    document.querySelector('[data-tab="ingredients"]').click();


    async function editUser(id) {
        try {
            console.log("Attempting to edit user with ID:", id); // Debug log
            
            const response = await fetch(`/api/users/${id}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });
            
            console.log("Response status:", response.status); // Debug log
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error:", errorText); // Debug log
                throw new Error(errorText || "Failed to fetch user data");
            }
            
            const user = await response.json();
            console.log("User data received:", user); // Debug log
            
            const form = document.getElementById("user-form");
            form.dataset.mode = "edit";
            form.dataset.id = id;
            
            document.getElementById("user-username").value = user.username || '';
            document.getElementById("user-email").value = user.email || '';
            document.getElementById("user-role").value = user.role || 'staff';
            document.getElementById("user-password").value = ''; // Clear password field
            
            form.querySelector("button[type='submit']").textContent = "Update User";
        } catch (error) {
            console.error("Edit user error:", error); // Debug log
            showError("Failed to load user", error);
        }
    }

async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        fetchUsers();
    } catch (error) {
        showError("Failed to delete user", error);
    }
}

// Update the user form submission handler
document.getElementById("user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.id;
    const isEdit = form.dataset.mode === "edit";

    // Basic validation
    const username = document.getElementById("user-username").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const role = document.getElementById("user-role").value;
    const password = document.getElementById("user-password").value;

    if (!username || !email || !role) {
        showError("Validation Error", new Error("All fields except password are required"));
        return;
    }

    if (!isEdit && !password) {
        showError("Validation Error", new Error("Password is required for new users"));
        return;
    }

    const userData = {
        username,
        email,
        role
    };

    // Only include password if it's provided (for updates) or for new users
    if (password) {
        userData.password = password;
    }

    try {
        const url = isEdit ? `/api/users/${id}` : "/api/users";
        const method = isEdit ? "PUT" : "POST";
        
        const response = await fetch(url, {
            method,
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Failed to ${isEdit ? 'update' : 'create'} user`);
        }

        // Reset form and refresh user list
        form.reset();
        delete form.dataset.mode;
        delete form.dataset.id;
        form.querySelector("button[type='submit']").textContent = "Add User";
        fetchUsers();
        
        // Show success message
        alert(`User ${isEdit ? 'updated' : 'created'} successfully!`);
    } catch (error) {
        showError(`Failed to ${isEdit ? 'update' : 'save'} user`, error);
    }
});

// Add these functions for user management
async function fetchUsers() {
    try {
        const response = await fetch("/api/users", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        const users = await response.json();
        renderUsersTable(users);
    } catch (error) {
        showError("Failed to load users", error);
    }
}

function renderUsersTable(users) {
    const tableBody = document.querySelector("#users-table tbody");
    tableBody.innerHTML = "";
    
    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="edit-btn" data-id="${user._id}">Edit</button>
                <button class="delete-btn" data-id="${user._id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("Edit button clicked with ID:", btn.dataset.id); // Debug log
            editUser(btn.dataset.id);
        });
    });
    
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => deleteUser(btn.dataset.id));
    });
}

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.dataset.tab;
            tabContents.forEach(content => content.classList.remove("active"));
            document.getElementById(targetTab).classList.add("active");

            if (targetTab === "ingredients") fetchIngredients();
            if (targetTab === "products") fetchProducts();
            if (targetTab === "orders") {
                fetchOrders();
                populateCustomerDropdown();
                populateProductDropdown();
            }
            if (targetTab === "customers") fetchCustomers();
            if (targetTab === "purchases") {
                fetchPurchases();
                populatePurchaseIngredientDropdown();
            }
        });
    });

    // Helper function to show errors
    function showError(message, error) {
        console.error(message, error);
        alert(`${message}: ${error.message}`);
    }

    // Ingredients Tab
    async function fetchIngredients() {
        try {
            const response = await fetch("/api/ingredients");
            if (!response.ok) throw new Error(await response.text());
            const ingredients = await response.json();
            renderIngredientsTable(ingredients);
        } catch (error) {
            showError("Failed to load ingredients", error);
        }
    }

    function renderIngredientsTable(ingredients) {
        const tableBody = document.querySelector("#ingredients-table tbody");
        tableBody.innerHTML = "";
        
        ingredients.forEach(ingredient => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${ingredient.ingredient_name}</td>
                <td>$${ingredient.unit_cost?.toFixed(2) || '0.00'}</td>
                <td>${ingredient.available_quantity} ${ingredient.unit_of_measure || ''}</td>
                <td>
                    <button class="edit-btn" data-id="${ingredient._id}">Edit</button>
                    <button class="delete-btn" data-id="${ingredient._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => editIngredient(btn.dataset.id));
        });
        
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteIngredient(btn.dataset.id));
        });
    }

    async function editIngredient(id) {
        try {
            const response = await fetch(`/api/ingredients/${id}`);
            if (!response.ok) throw new Error(await response.text());
            const ingredient = await response.json();
            
            const form = document.getElementById("ingredient-form");
            form.dataset.mode = "edit";
            form.dataset.id = id;
            
            document.getElementById("ingredient-name").value = ingredient.ingredient_name;
            document.getElementById("ingredient-cost").value = ingredient.unit_cost;
            document.getElementById("ingredient-quantity").value = ingredient.available_quantity;
            document.getElementById("ingredient-unit").value = ingredient.unit_of_measure || '';
            
            form.querySelector("button[type='submit']").textContent = "Update Ingredient";
        } catch (error) {
            showError("Failed to load ingredient", error);
        }
    }

    async function deleteIngredient(id) {
        if (!confirm("Are you sure you want to delete this ingredient?")) return;
        
        try {
            const response = await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error(await response.text());
            fetchIngredients();
        } catch (error) {
            showError("Failed to delete ingredient", error);
        }
    }

    document.getElementById("ingredient-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const id = form.dataset.id;
        const isEdit = form.dataset.mode === "edit";

        const ingredientData = {
            ingredient_name: document.getElementById("ingredient-name").value,
            unit_cost: parseFloat(document.getElementById("ingredient-cost").value),
            available_quantity: parseInt(document.getElementById("ingredient-quantity").value),
            unit_of_measure: document.getElementById("ingredient-unit").value
        };

        try {
            const url = isEdit ? `/api/ingredients/${id}` : "/api/ingredients";
            const method = isEdit ? "PUT" : "POST";
            
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ingredientData)
            });

            if (!response.ok) throw new Error(await response.text());

            // Reset form and refresh
            form.reset();
            delete form.dataset.mode;
            delete form.dataset.id;
            form.querySelector("button[type='submit']").textContent = "Add Ingredient";
            fetchIngredients();
        } catch (error) {
            showError("Failed to save ingredient", error);
        }
    });

    // Products Tab
    async function fetchProducts() {
        try {
            const response = await fetch("/api/products");
            if (!response.ok) throw new Error(await response.text());
            const products = await response.json();
            renderProductsTable(products);
        } catch (error) {
            showError("Failed to load products", error);
        }
    }

    function renderProductsTable(products) {
        const tableBody = document.querySelector("#products-table tbody");
        tableBody.innerHTML = "";
        
        products.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.product_name}</td>
                <td>$${product.product_price?.toFixed(2) || '0.00'}</td>
                <td>${product.description || ''}</td>
                <td>
                    <button class="view-ingredients" data-id="${product._id}">View Ingredients</button>
                    <button class="edit-btn" data-id="${product._id}">Edit</button>
                    <button class="delete-btn" data-id="${product._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => editProduct(btn.dataset.id));
        });
        
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
        });
    }

    async function editProduct(id) {
        try {
            const response = await fetch(`/api/products/${id}`);
            if (!response.ok) throw new Error(await response.text());
            const product = await response.json();
            
            const form = document.getElementById("product-form");
            form.dataset.mode = "edit";
            form.dataset.id = id;
            
            document.getElementById("product-name").value = product.product_name;
            document.getElementById("product-price").value = product.product_price;
            document.getElementById("product-description").value = product.description || '';
            
            form.querySelector("button[type='submit']").textContent = "Update Product";
        } catch (error) {
            showError("Failed to load product", error);
        }
    }

    async function deleteProduct(id) {
        if (!confirm("Are you sure you want to delete this product?")) return;
        
        try {
            const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error(await response.text());
            fetchProducts();
        } catch (error) {
            showError("Failed to delete product", error);
        }
    }

    document.getElementById("product-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const id = form.dataset.id;
        const isEdit = form.dataset.mode === "edit";

        const productData = {
            product_name: document.getElementById("product-name").value,
            product_price: parseFloat(document.getElementById("product-price").value),
            description: document.getElementById("product-description").value
        };

        try {
            const url = isEdit ? `/api/products/${id}` : "/api/products";
            const method = isEdit ? "PUT" : "POST";
            
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            if (!response.ok) throw new Error(await response.text());

            // Reset form and refresh
            form.reset();
            delete form.dataset.mode;
            delete form.dataset.id;
            form.querySelector("button[type='submit']").textContent = "Add Product";
            fetchProducts();
        } catch (error) {
            showError("Failed to save product", error);
        }
    });

    // Customers Tab
    async function fetchCustomers() {
        try {
            const response = await fetch("/api/customers");
            if (!response.ok) throw new Error(await response.text());
            const customers = await response.json();
            renderCustomersTable(customers);
        } catch (error) {
            showError("Failed to load customers", error);
        }
    }

    function renderCustomersTable(customers) {
        const tableBody = document.querySelector("#customers-table tbody");
        tableBody.innerHTML = "";
        
        customers.forEach(customer => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${customer.customer_name}</td>
                <td>${customer.customer_contact_number}</td>
                <td>${customer.email || ''}</td>
                <td>${customer.customer_address}</td>
                <td>
                    <button class="edit-btn" data-id="${customer._id}">Edit</button>
                    <button class="delete-btn" data-id="${customer._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => editCustomer(btn.dataset.id));
        });
        
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteCustomer(btn.dataset.id));
        });
    }

    async function editCustomer(id) {
        try {
            const response = await fetch(`/api/customers/${id}`);
            if (!response.ok) throw new Error(await response.text());
            const customer = await response.json();
            
            const form = document.getElementById("customer-form");
            form.dataset.mode = "edit";
            form.dataset.id = id;
            
            document.getElementById("customer-name").value = customer.customer_name;
            document.getElementById("customer-contact").value = customer.customer_contact_number;
            document.getElementById("customer-email").value = customer.email || '';
            document.getElementById("customer-address").value = customer.customer_address;
            
            form.querySelector("button[type='submit']").textContent = "Update Customer";
        } catch (error) {
            showError("Failed to load customer", error);
        }
    }

    async function deleteCustomer(id) {
        if (!confirm("Are you sure you want to delete this customer?")) return;
        
        try {
            const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error(await response.text());
            fetchCustomers();
        } catch (error) {
            showError("Failed to delete customer", error);
        }
    }

    document.getElementById("customer-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const id = form.dataset.id;
        const isEdit = form.dataset.mode === "edit";

        const customerData = {
            customer_name: document.getElementById("customer-name").value,
            customer_contact_number: document.getElementById("customer-contact").value,
            email: document.getElementById("customer-email").value,
            customer_address: document.getElementById("customer-address").value
        };

        try {
            const url = isEdit ? `/api/customers/${id}` : "/api/customers";
            const method = isEdit ? "PUT" : "POST";
            
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customerData)
            });

            if (!response.ok) throw new Error(await response.text());

            // Reset form and refresh
            form.reset();
            delete form.dataset.mode;
            delete form.dataset.id;
            form.querySelector("button[type='submit']").textContent = "Add Customer";
            fetchCustomers();
        } catch (error) {
            showError("Failed to save customer", error);
        }
    });

    // Orders Tab
    async function populateCustomerDropdown() {
        try {
            const response = await fetch("/api/customers");
            if (!response.ok) throw new Error(await response.text());
            const customers = await response.json();
            
            const dropdown = document.getElementById("order-customer-id");
            dropdown.innerHTML = '<option value="">Select Customer</option>';
            
            customers.forEach(customer => {
                const option = document.createElement("option");
                option.value = customer._id;
                option.textContent = customer.customer_name;
                dropdown.appendChild(option);
            });
        } catch (error) {
            showError("Failed to load customers", error);
        }
    }

    async function populateProductDropdown() {
        try {
            const response = await fetch("/api/products");
            if (!response.ok) throw new Error(await response.text());
            const products = await response.json();
            
            const dropdowns = document.querySelectorAll(".order-product-id");
            dropdowns.forEach(dropdown => {
                // Save current selection
                const currentValue = dropdown.value;
                dropdown.innerHTML = '<option value="">Select Product</option>';
                
                products.forEach(product => {
                    const option = document.createElement("option");
                    option.value = product._id;
                    option.textContent = `${product.product_name} ($${product.product_price?.toFixed(2) || '0.00'})`;
                    dropdown.appendChild(option);
                });
                
                // Restore selection if it exists
                if (currentValue) {
                    dropdown.value = currentValue;
                }
            });
        } catch (error) {
            showError("Failed to load products", error);
        }
    }

    async function fetchOrders() {
        try {
            const response = await fetch("/api/orders");
            if (!response.ok) throw new Error(await response.text());
            const orders = await response.json();
            renderOrdersTable(orders);
        } catch (error) {
            showError("Failed to load orders", error);
        }
    }

    function renderOrdersTable(orders) {
        const tableBody = document.querySelector("#orders-table tbody");
        tableBody.innerHTML = "";
        
        orders.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.customer_info?.customer_name || 'Unknown'}</td>
                <td>${order.order_items?.map(item => 
                    `${item.quantity}x ${item.product_info?.product_name || 'Unknown'} ($${item.unit_price?.toFixed(2) || '0.00'})`
                ).join(", ") || 'No items'}</td>
                <td>$${order.total_amount?.toFixed(2) || '0.00'}</td>
                <td>${order.order_status}</td>
                <td>${new Date(order.order_date).toLocaleDateString()}</td>
                <td>
                    <button class="edit-btn" data-id="${order._id}">Edit</button>
                    <button class="delete-btn" data-id="${order._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => editOrder(btn.dataset.id));
        });
        
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteOrder(btn.dataset.id));
        });
    }

    async function editOrder(id) {
        try {
            const response = await fetch(`/api/orders/${id}`);
            if (!response.ok) throw new Error(await response.text());
            const order = await response.json();
            
            const form = document.getElementById("order-form");
            form.dataset.mode = "edit";
            form.dataset.id = id;
            
            // Set customer
            document.getElementById("order-customer-id").value = order.customer_id;
            
            // Set status
            document.getElementById("order-status").value = order.order_status;
            
            // Clear existing items
            const container = document.getElementById("order-items-container");
            container.innerHTML = "";
            
            // Add current items
            if (order.order_items && order.order_items.length > 0) {
                await populateProductDropdown(); // Ensure products are loaded first
                
                order.order_items.forEach(item => {
                    addOrderItemToForm(item.product_id, item.quantity);
                });
            } else {
                // Add one empty item if no items exist
                addOrderItemToForm();
            }
            
            form.querySelector("button[type='submit']").textContent = "Update Order";
        } catch (error) {
            showError("Failed to load order", error);
        }
    }

    function addOrderItemToForm(productId = "", quantity = 1) {
        const container = document.getElementById("order-items-container");
        const newItem = document.createElement("div");
        newItem.className = "order-item";
        newItem.innerHTML = `
            <select class="order-product-id" required>
                <option value="">Select Product</option>
            </select>
            <input type="number" class="order-quantity" placeholder="Quantity" required min="1" value="${quantity}">
            <button type="button" class="remove-item">Remove</button>
        `;
        container.appendChild(newItem);
        
        // Populate the product dropdown
        populateProductDropdown().then(() => {
            if (productId) {
                const select = newItem.querySelector(".order-product-id");
                select.value = productId;
            }
        });
    }

    async function deleteOrder(id) {
        if (!confirm("Are you sure you want to delete this order?")) return;
        
        try {
            const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error(await response.text());
            fetchOrders();
        } catch (error) {
            showError("Failed to delete order", error);
        }
    }

    document.getElementById("order-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const id = form.dataset.id;
        const isEdit = form.dataset.mode === "edit";
        
        const customerId = document.getElementById("order-customer-id").value;
        const status = document.getElementById("order-status").value;
        
        // Get all order items
        const orderItems = [];
        document.querySelectorAll(".order-item").forEach(item => {
            const productId = item.querySelector(".order-product-id").value;
            const quantity = item.querySelector(".order-quantity").value;
            
            if (productId && quantity) {
                orderItems.push({
                    product_id: productId,
                    quantity: parseInt(quantity)
                });
            }
        });
    
        if (orderItems.length === 0) {
            alert("Please add at least one order item");
            return;
        }
    
        const orderData = {
            customer_id: customerId,
            order_status: status,
            order_items: orderItems
        };
    
        try {
            const url = isEdit ? `/api/orders/${id}` : "/api/orders";
            const method = isEdit ? "PUT" : "POST";
            
            const response = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(orderData)
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Failed to ${isEdit ? 'update' : 'save'} order`);
            }
    
            const updatedOrder = await response.json();
            
            // Reset form and refresh
            form.reset();
            document.getElementById("order-items-container").innerHTML = "";
            addOrderItemToForm(); // Add one empty item
            delete form.dataset.mode;
            delete form.dataset.id;
            form.querySelector("button[type='submit']").textContent = "Add Order";
            fetchOrders();
        } catch (error) {
            showError(`Failed to ${isEdit ? 'update' : 'save'} order`, error);
        }
    });
    
    // adding/removing order items
    document.getElementById("add-order-item").addEventListener("click", () => {
        addOrderItemToForm();
    });
    
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-item")) {
            if (document.querySelectorAll(".order-item").length > 1) {
                e.target.closest(".order-item").remove();
            } else {
                alert("You need at least one order item");
            }
        }
    });

    // Purchases Tab
    async function populatePurchaseIngredientDropdown() {
        try {
            const response = await fetch("/api/ingredients");
            if (!response.ok) throw new Error(await response.text());
            const ingredients = await response.json();
            
            const dropdown = document.getElementById("purchase-ingredient-id");
            dropdown.innerHTML = '<option value="">Select Ingredient</option>';
            
            ingredients.forEach(ingredient => {
                const option = document.createElement("option");
                option.value = ingredient._id;
                option.textContent = ingredient.ingredient_name;
                dropdown.appendChild(option);
            });
        } catch (error) {
            showError("Failed to load ingredients", error);
        }
    }

    async function fetchPurchases() {
        try {
            const response = await fetch("/api/purchases");
            if (!response.ok) throw new Error(await response.text());
            const purchases = await response.json();
            renderPurchasesTable(purchases);
        } catch (error) {
            showError("Failed to load purchases", error);
        }
    }

    function renderPurchasesTable(purchases) {
        const tableBody = document.querySelector("#purchases-table tbody");
        tableBody.innerHTML = "";
        
        purchases.forEach(purchase => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${purchase.ingredient_info?.ingredient_name || 'Unknown'}</td>
                <td>${purchase.quantity}</td>
                <td>$${purchase.unit_cost?.toFixed(2) || '0.00'}</td>
                <td>$${(purchase.quantity * purchase.unit_cost).toFixed(2)}</td>
                <td>${purchase.supplier || ''}</td>
                <td>${new Date(purchase.purchase_date).toLocaleDateString()}</td>
                <td>
                    <button class="delete-btn" data-id="${purchase._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deletePurchase(btn.dataset.id));
        });
    }

    document.getElementById("purchase-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const purchaseData = {
            ingredient_id: document.getElementById("purchase-ingredient-id").value,
            quantity: parseInt(document.getElementById("purchase-quantity").value),
            unit_cost: parseFloat(document.getElementById("purchase-unit-cost").value),
            supplier: document.getElementById("purchase-supplier").value,
            purchase_date: document.getElementById("purchase-date").value
        };
    
        try {
            const response = await fetch("/api/purchases", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(purchaseData)
            });
    
            if (!response.ok) throw new Error(await response.text());
    
            // Reset form and refresh
            e.target.reset();
            fetchPurchases();
            fetchIngredients(); // Refresh ingredients list too
        } catch (error) {
            showError("Failed to save purchase", error);
        }
    });
    
    async function deletePurchase(id) {
        if (!confirm("Are you sure you want to delete this purchase?")) return;
        
        try {
            // Just make the DELETE request - backend handles the rest
            const response = await fetch(`/api/purchases/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            
            if (!response.ok) throw new Error(await response.text());
    
            // Refresh both lists
            fetchPurchases();
            fetchIngredients();
            
        } catch (error) {
            showError("Failed to delete purchase", error);
        }
    }

    // Initialize with Ingredients tab
    document.querySelector('[data-tab="ingredients"]').click();
});