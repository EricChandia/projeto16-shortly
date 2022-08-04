import { Router } from "express";
import validateUser from "../middlewares/validateUser.js"
import { shortenUrl } from "../controllers/shortenUrlController.js";

const router = Router();

router.post("/urls/shorten", validateUser, shortenUrl);

export default router;