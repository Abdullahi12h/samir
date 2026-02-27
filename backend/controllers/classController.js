import Class from '../models/Class.js';

export const getClasses = async (req, res) => {
    try {
        let query = {};
        if (req.user && req.user.role === 'Teacher') {
            const { default: Teacher } = await import('../models/Teacher.js');
            const teacher = await Teacher.findOne({ user: req.user._id }).populate('subjectId subjects');

            if (teacher) {
                const assignedClasses = teacher.classIds || [];
                // Also include classes from assigned subjects just in case
                if (teacher.subjects && teacher.subjects.length > 0) {
                    teacher.subjects.forEach(sub => {
                        if (sub.classId && !assignedClasses.includes(sub.classId.toString())) {
                            assignedClasses.push(sub.classId);
                        }
                    });
                }
                query._id = { $in: assignedClasses };
            }
        }
        const classes = await Class.find(query).populate('skillId', 'name');
        res.json(classes);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createClass = async (req, res) => {
    try {
        const { name, description, skillId } = req.body;
        const classItem = await Class.create({ name, description, skillId });
        res.status(201).json(classItem);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteClass = async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class deleted' });
    } catch (error) { res.status(404).json({ message: 'Class not found' }); }
};
