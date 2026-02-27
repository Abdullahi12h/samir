import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        durationMonths: {
            type: Number,
            required: true,
            default: 1
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        isClosed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
