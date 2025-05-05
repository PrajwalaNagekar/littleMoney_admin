import express from "express";
import { emailVerify, verifyOtp } from '../controllers/AuthController.js'
import { getAllDetails, getOffersApi, getSummaryApi } from '../controllers/admin/admin.controller.js'
const router = express.Router();

router.post('/email-verification', emailVerify)
router.post('/otp-verification', verifyOtp)
router.get('/all-details', getAllDetails)
// router.get('/test-offer', (req, res) => {
//     res.send('Test Offer Route Working');
//   });
router.get('/all-offers/:leadId', getOffersApi)
router.get('/get-summary/:leadId', getSummaryApi)



export default router;