import { Router } from "express";
import validateUser from "../middlewares/validateUser.js"
import { deleteUrlById, getShortUrlById, getUserUrls, openShortUrl, shortenUrl } from "../controllers/shortenUrlController.js";

const router = Router();

router.post("/urls/shorten", validateUser, shortenUrl);
router.get("/urls/:id", getShortUrlById);
router.get("/urls/open/:shortUrl", openShortUrl);
router.delete("/urls/:id", validateUser, deleteUrlById);
router.get("/users/me", validateUser, getUserUrls);

export default router;