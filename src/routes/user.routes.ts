import * as express from "express";
import { authorization } from "../middleware/authorization";
import { authentication } from "../middleware/authentication";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";

const Router = express.Router();

Router.get(
    "/",
    authentication,
    authorization(["admin"]),
    UserController.getUsers
);
Router.get(
    "/me",
    authentication,
    authorization(["user", "admin"]),
    AuthController.getProfile
);
Router.post("/register", UserController.register);
Router.post("/login", AuthController.login);
Router.put(
    "/:id",
    authentication,
    authorization(["user", "admin"]),
    UserController.updateUser
);
Router.delete(
    "/:id",
    authentication,
    authorization(["admin"]),
    UserController.deleteUser
);

export { Router as userRouter };