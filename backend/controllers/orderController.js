import Order from '../models/Order.js';
import Message from '../models/Message.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Student
const createOrder = async (req, res) => {
    try {
        const { serviceDescription } = req.body;

        if (!serviceDescription) {
            return res.status(400).json({ message: 'Service description is required' });
        }

        console.log(`[createOrder] Attempting to create order for user: ${req.user?._id}`);

        const order = await Order.create({
            student: req.user._id,
            serviceDescription,
        });

        if (order) {
            console.log(`[createOrder] Order created successfully: ${order._id}`);
            res.status(201).json(order);
        } else {
            res.status(400).json({ message: 'Invalid order data' });
        }
    } catch (error) {
        console.error(`[createOrder] Error: ${error.message}`);
        console.error(error.stack);
        res.status(500).json({ message: 'Server Error: Failed to create order', error: error.message });
    }
};

// @desc    Get all orders (Admin) or user orders (Student)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    let orders;
    if (req.user.role === 'Admin') {
        orders = await Order.find({}).populate('student', 'name username').sort({ createdAt: -1 });
    } else {
        orders = await Order.find({ student: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(orders);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('student', 'name username');

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order (Admin: set price, update status, Student: submit payment)
// @route   PATCH /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    const io = req.app.get('io');

    if (order) {
        if (req.user.role === 'Admin') {
            order.price = req.body.price !== undefined ? req.body.price : order.price;
            order.status = req.body.status || order.status;

            if (req.body.status === 'Ready') {
                // Automated message: "adeegaagi waa diyaar"
                const autoMsg = await Message.create({
                    order: order._id,
                    sender: req.user._id,
                    text: 'adeegaagi waa diyaar',
                });
                const populatedMsg = await Message.findById(autoMsg._id).populate('sender', 'name role');
                io.to(order._id.toString()).emit('receive_message', populatedMsg);
            }
        } else {
            // Validate student ownership
            if (order.student.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this order' });
            }

            // Student can only update payment info if status is Quoted or Pending
            if (order.status === 'Quoted' || order.status === 'Pending') {
                order.amountPaid = req.body.amountPaid !== undefined ? req.body.amountPaid : order.amountPaid;
                order.phoneNumber = req.body.phoneNumber || order.phoneNumber;
                order.status = 'Paid';
            } else {
                return res.status(400).json({ message: 'Cannot update payment for this order status' });
            }
        }

        const updatedOrder = await order.save();

        // Emit status update to room
        io.to(order._id.toString()).emit('status_changed', updatedOrder);

        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get messages for an order
// @route   GET /api/orders/:id/messages
// @access  Private
const getOrderMessages = async (req, res) => {
    const messages = await Message.find({ order: req.params.id }).populate('sender', 'name role');
    res.json(messages);
};

// @desc    Post message to an order
// @route   POST /api/orders/:id/messages
// @access  Private
const postOrderMessage = async (req, res) => {
    const { text } = req.body;
    const orderId = req.params.id;
    const io = req.app.get('io');

    if (!text) {
        return res.status(400).json({ message: 'Message text is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Role-based validation
    if (req.user.role !== 'Admin' && order.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to message on this order' });
    }

    const message = await Message.create({
        order: orderId,
        sender: req.user._id,
        text,
    });

    if (message) {
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name role');

        // Broadcast message to everyone in the room
        io.to(orderId).emit('receive_message', populatedMessage);

        res.status(201).json(populatedMessage);
    } else {
        res.status(400).json({ message: 'Invalid message data' });
    }
};

export {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    getOrderMessages,
    postOrderMessage,
};
