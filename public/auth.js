document.addEventListener("DOMContentLoaded", () => {
    // Login form handler
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Login failed");
                }

                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.role);
                localStorage.setItem("username", data.username);
                window.location.href = "index.html";
            } catch (error) {
                alert(error.message);
                console.error("Login error:", error);
            }
        });
    }

    // Registration form handler
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("reg-username").value;
            const password = document.getElementById("reg-password").value;
            const email = document.getElementById("reg-email").value;

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password, email, role: "staff" })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Registration failed");
                }

                alert("Registration successful! Please login.");
                window.location.href = "login.html";
            } catch (error) {
                alert(error.message);
                console.error("Registration error:", error);
            }
        });
    }
});