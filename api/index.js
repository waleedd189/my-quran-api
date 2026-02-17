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
const surahAyas = allAyas.filter(a => a.sura_no == surah);
if (surahAyas.length > 0) {
res.status(200).json({
creator: "Waleed The Source",
name: surahAyas[0].sura_name_ar,
ayahs: surahAyas
});
} else {
res.status(404).json({ error: "السورة مش موجودة" });
}
} catch (e) {
res.status(500).json({ error: "السيرفر مش قادر يقرأ الملف" });
}
};
