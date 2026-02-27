import Batch from '../models/Batch.js';

export const getBatches = async (req, res) => {
    try {
        const batches = await Batch.find({}).populate('classId', 'name');
        res.json(batches);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createBatch = async (req, res) => {
    try {
        const { name, classId, durationMonths, startDate } = req.body;
        const batch = await Batch.create({ name, classId, durationMonths, startDate });
        res.status(201).json(batch);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteBatch = async (req, res) => {
    try {
        await Batch.findByIdAndDelete(req.params.id);
        res.json({ message: 'Batch deleted' });
    } catch (error) { res.status(404).json({ message: 'Batch not found' }); }
};
