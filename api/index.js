module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Content-Type', 'application/json');
const { surah = 1 } = req.query;
try {
const response = await fetch(https://api.alquran.cloud/v1/surah/${surah});
const data = await response.json();
if (data.code === 200) {
res.status(200).json({
creator: "Waleed Server",
name: data.data.name,
ayahs: data.data.ayahs
});
} else {
res.status(404).json({ error: "السورة غير موجودة" });
}
} catch (e) {
res.status(500).json({ error: "مشكلة في السيرفر" });
}
};
