import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        serviceDescription: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            default: 0,
        },
        amountPaid: {
            type: Number,
            default: 0,
        },
        phoneNumber: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Pending', 'Quoted', 'Paid', 'Processing', 'Ready', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        balance: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate balance before saving
orderSchema.pre('save', function () {
    if (this.price !== undefined && this.amountPaid !== undefined) {
        this.balance = this.price - this.amountPaid;
    }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
