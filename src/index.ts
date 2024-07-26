import * as express from "express";
import * as dotenv from "dotenv";
import "reflect-metadata";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { apiRouter } from './routes'
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();
const { PORT = 3000 } = process.env;

app.use(express.json());
app.use(errorHandler);
app.use("/api", apiRouter);

app.get("*", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello from Hooray HOA" });
});

AppDataSource.initialize()
    .then(async () => {
        app.listen(PORT, () => {
            console.log("Server is running on http://localhost:" + PORT);
        });
        console.log("Data Source has been initialized!");
    })
    .catch((error) => console.log(error));