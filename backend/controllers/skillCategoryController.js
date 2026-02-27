import SkillCategory from '../models/SkillCategory.js';

export const getSkillCategories = async (req, res) => {
    try {
        const categories = await SkillCategory.find({});
        res.json(categories);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createSkillCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await SkillCategory.create({ name, description });
        res.status(201).json(category);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteSkillCategory = async (req, res) => {
    try {
        await SkillCategory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill Category deleted' });
    } catch (error) { res.status(404).json({ message: 'Category not found' }); }
};
