import express from 'express';
const router = express.Router();
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    getOrderMessages,
    postOrderMessage,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, createOrder)
    .get(protect, getOrders);

router.route('/:id')
    .get(protect, getOrderById)
    .patch(protect, updateOrder);

router.route('/:id/messages')
    .get(protect, getOrderMessages)
    .post(protect, postOrderMessage);

export default router;
