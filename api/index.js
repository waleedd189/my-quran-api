const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Content-Type', 'application/json');
const { surah = 1 } = req.query;
try {
const filePath = path.join(process.cwd(), 'quran_data.json');
const jsonData = fs.readFileSync(filePath, 'utf-8');
const quran = JSON.parse(jsonData);
if (quran[surah]) {
res.status(200).json({
creator: "Waleed The Source",
quran_data: quran[surah]
});
} else {
res.status(404).json({ error: "السورة مش عندي يا برنس" });
}
} catch (e) {
res.status(500).json({ error: "فيه مشكلة في السيرفر" });
}
};
