const multer = require('multer');

// Use Memory Storage for processing files in memory (like Excel) without saving to disk
const storage = multer.memoryStorage();

const uploadFile = multer({ storage: storage });

module.exports = {
    uploadFile
};
