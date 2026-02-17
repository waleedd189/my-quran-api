module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Content-Type', 'application/json');
const { surah = 1 } = req.query;
const resp = await fetch('https://api.alquran.cloud/v1/surah/' + surah);
const info = await resp.json();
res.status(200).json({
creator: "Waleed",
quran_data: info.data
});
};
