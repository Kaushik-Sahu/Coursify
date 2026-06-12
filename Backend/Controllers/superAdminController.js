const { User, Admin } = require('../database/db');

const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCreators = async (req, res) => {
    try {
        const creators = await Admin.find({});
        res.json({ creators });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCreator = async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.json({ message: 'Creator deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsers,
    getCreators,
    deleteUser,
    deleteCreator
};
