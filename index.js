module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '*');
const { surah = 1 } = req.query;
const resp = await fetch('' + surah);
const info = await resp.json();
res.status(200).json({
creator: "Waleed",
quran_data: info.data
});
};
