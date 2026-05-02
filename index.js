import dotenv from "dotenv";
import app from "./src/validators/app.js";
import connectDB from "./src/db/index.js";

dotenv.config({
    path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(
                `Example app listening on port http://localhost:${port}`,
            );
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error", err);
        process.exit(1);
    });
