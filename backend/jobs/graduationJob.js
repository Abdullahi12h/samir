import cron from 'node-cron';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';

// Run every day at midnight (00:00)
const graduationJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('[GraduationJob] Running daily check for expired batches...');
        try {
            // Find all active batches
            const activeBatches = await Batch.find({ isClosed: false });

            for (const batch of activeBatches) {
                if (!batch.startDate || !batch.durationMonths) continue;

                // Calculate expiry date
                const expiryDate = new Date(batch.startDate);
                expiryDate.setMonth(expiryDate.getMonth() + batch.durationMonths);

                // Check if current date is past the expiry date
                if (new Date() >= expiryDate) {
                    console.log(`[GraduationJob] Batch ${batch.name} (${batch._id}) has expired. Updating students...`);

                    // Update all active students in this batch to Graduated
                    const result = await Student.updateMany(
                        { batchId: batch._id, status: 'Active' },
                        { $set: { status: 'Graduated' } }
                    );

                    console.log(`[GraduationJob] Graduated ${result.modifiedCount} students from batch ${batch.name}.`);

                    // Mark batch as closed
                    batch.isClosed = true;
                    await batch.save();
                }
            }
        } catch (error) {
            console.error('[GraduationJob] Error running auto-graduation:', error);
        }
    });
};

export default graduationJob;
