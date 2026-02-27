import Skill from '../models/Skill.js';

export const getSkills = async (req, res) => {
    try {
        let query = {};
        if (req.user && req.user.role === 'Teacher') {
            const { default: Teacher } = await import('../models/Teacher.js');
            const teacher = await Teacher.findOne({ user: req.user._id });
            if (teacher && teacher.skills && teacher.skills.length > 0) {
                query._id = { $in: teacher.skills };
            }
        }
        const skills = await Skill.find(query);
        res.json(skills);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createSkill = async (req, res) => {
    try {
        const { name, description } = req.body;
        const skill = await Skill.create({ name, description });
        res.status(201).json(skill);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteSkill = async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill deleted' });
    } catch (error) { res.status(404).json({ message: 'Skill not found' }); }
};
