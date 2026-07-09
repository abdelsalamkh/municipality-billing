require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("./config/db");

async function createAdmin() {

    const password = await bcrypt.hash("admin123", 10);

    await db.query(
        `
        INSERT INTO users
        (name, username, password, role)
        VALUES (?, ?, ?, ?)
        `,
        [
            "System Administrator",
            "admin",
            password,
            "admin"
        ]
    );

    console.log("Admin created.");

    process.exit();
}

createAdmin();