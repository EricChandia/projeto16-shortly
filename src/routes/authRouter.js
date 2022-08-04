import { createUser, loginUser } from "../controllers/authController.js";
import { Router } from "express";

const router = Router();

router.post('/signin', loginUser);
router.post('/signup', createUser);

export default router;
