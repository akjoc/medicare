const AppSetting = require('../models/AppSetting');

// Helper to get or create the single setting instance
const getSettingInstance = async () => {
    let setting = await AppSetting.findOne();
    if (!setting) {
        setting = await AppSetting.create({});
    }
    return setting;
};

// @desc    Get App Settings
// @route   GET /api/app-settings
// @access  Public
const getAppSettings = async (req, res) => {
    try {
        const settings = await getSettingInstance();
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update App Settings
// @route   PUT /api/app-settings
// @access  Private/Admin
const updateAppSettings = async (req, res) => {
    try {
        const setting = await getSettingInstance();

        await setting.update(req.body);

        const updatedSetting = await AppSetting.findOne();
        res.json(updatedSetting);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAppSettings,
    updateAppSettings
};
