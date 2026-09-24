const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

// Health check
app.get("/health", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT 1 AS database_connected"
        );

        res.json({
            success: true,
            message: "EduSupport API is running",
            database: rows[0].database_connected === 1
        });
    } catch (error) {
        console.error(
            "Database connection error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `EduSupport API running on port ${PORT}`
    );
});