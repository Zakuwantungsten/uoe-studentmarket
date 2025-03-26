const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/auth.middleware")
const paymentController = require("../controllers/payment.controller")

// Payment routes
router.post("/process", protect, paymentController.processPayment)
router.post("/mpesa", protect, paymentController.processMpesaPayment)
router.post("/mpesa/callback", paymentController.mpesaCallback)
router.get("/transaction/:id", protect, paymentController.getTransaction)
router.get("/my-transactions", protect, paymentController.getMyTransactions)
router.get("/transactions", protect, authorize("admin"), paymentController.getAllTransactions)

module.exports = router

