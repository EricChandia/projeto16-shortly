import { Router } from "express";
import validateUser from "../middlewares/validateUser.js"
import { getShortUrlById, openShortUrl, shortenUrl } from "../controllers/shortenUrlController.js";

const router = Router();

router.post("/urls/shorten", validateUser, shortenUrl);
router.get("/urls/:id", getShortUrlById);
router.get("/urls/open/:shortUrl", openShortUrl);

export default router;