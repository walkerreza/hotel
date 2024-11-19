import express from "express";
import {
    tambahuser, login
} from "../controllers/user.controllers.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";

const routerUser = express.Router();
routerUser.post("/", tambahuser);
routerUser.post("/login", login);
routerUser.get("/dashboard", authenticateToken, (req, res) => {
    if (req.user.role === 'admin') {
        res.send("Welcome to the admin dashboard!");
    } else if (req.user.role === 'user') {
        res.send("Welcome to the user dashboard!");
    } else {
        res.status(403).send("Access denied");
    }
});
export default routerUser;
