import express from "express";
import { emailVerify, verifyOtp } from '../controllers/AuthController.js'
const router = express.Router();

router.post('/email-verification', emailVerify)
router.post('/otp-verification', verifyOtp)

export default router;