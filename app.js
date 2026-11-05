import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";

const app = express();

const port = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());


app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Server Started on Port: ${port}`);
});