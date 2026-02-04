import express from "express";
import { 
    tambahuser, 
    login, 
    getAllUsers, 
    getProfile, 
    updateProfile, 
    changePassword,
    uploadProfilePhoto,
    getAllUsersForDropdown
} from "../controllers/user.controllers.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";
import { isAdmin } from "../middleware/CheckRole.js";
import { logActivity } from "../middleware/ActivityLogger.js";

const routerUser = express.Router();

routerUser.post("/", 
    logActivity('CREATE', 'Registrasi user baru'),
    tambahuser
);

routerUser.post("/login", 
    logActivity('LOGIN', 'User login'),
    login
);

routerUser.get("/", 
    authenticateToken, 
    isAdmin, 
    logActivity('READ', 'Melihat daftar user'),
    getAllUsers
);

routerUser.get("/dashboard", 
    authenticateToken, 
    logActivity('READ', 'Akses dashboard'),
    (req, res) => {
        if (req.user.role === 'admin') {
            res.send("Welcome to the admin dashboard!");
        } else if (req.user.role === 'user') {
            res.send("Welcome to the user dashboard!");
        } else {
            res.status(403).send("Access denied");
        }
    }
);

routerUser.get("/profile", 
    authenticateToken, 
    logActivity('READ', 'Melihat profil user'),
    getProfile
);

routerUser.put("/profile", 
    authenticateToken,
    logActivity('UPDATE', 'Mengupdate profil user'),
    updateProfile
);

routerUser.post("/profile/photo",
    authenticateToken,
    logActivity('UPDATE', 'Mengupload foto profil'),
    uploadProfilePhoto
);

routerUser.put("/change-password",
    authenticateToken,
    logActivity('UPDATE', 'Mengubah password user'),
    changePassword
);

routerUser.get("/dropdown", 
    authenticateToken, 
    logActivity('READ', 'Mengambil data user untuk dropdown'),
    getAllUsersForDropdown
);

export default routerUser;
