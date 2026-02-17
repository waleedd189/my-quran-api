const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Content-Type', 'application/json');

const { surah = 1 } = req.query;

try {
const filePath = path.join(process.cwd(), 'quran_data.json');
const jsonData = fs.readFileSync(filePath, 'utf-8');
const allAyas = JSON.parse(jsonData);

} catch (e) {
res.status(500).json({ error: "تأكد من رفع ملف quran_data.json كاملاً" });
}
};
