import Subject from '../models/Subject.js';

export const getSubjects = async (req, res) => {
    try {
        const reqClassId = req.query.classId;
        let query = reqClassId ? { classId: reqClassId } : {};

        // If Teacher is logged in, restrict to subjects they teach
        if (req.user && req.user.role === 'Teacher') {
            const { default: Teacher } = await import('../models/Teacher.js');
            const teacher = await Teacher.findOne({ user: req.user._id });
            if (teacher) {
                const assignedSubjects = teacher.subjects || [];
                if (teacher.subjectId && !assignedSubjects.includes(teacher.subjectId.toString())) {
                    assignedSubjects.push(teacher.subjectId);
                }
                query._id = { $in: assignedSubjects };
            }
        }

        const subjects = await Subject.find(query).populate('classId', 'name');
        res.json(subjects);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createSubject = async (req, res) => {
    try {
        const { name, classId } = req.body;
        const subject = await Subject.create({ name, classId });
        res.status(201).json(subject);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteSubject = async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subject deleted' });
    } catch (error) { res.status(404).json({ message: 'Subject not found' }); }
};
