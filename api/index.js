const fs = require('fs');
const path = require('path');

// تحميل بيانات القرآن
let quranData = null;

function loadQuranData() {
    if (!quranData) {
        try {
            const filePath = path.join(process.cwd(), 'quran_data.json');
            const data = fs.readFileSync(filePath, 'utf8');
            quranData = JSON.parse(data);
        } catch (error) {
            console.error('خطأ في قراءة الملف:', error.message);
            return null;
        }
    }
    return quranData;
}

module.exports = async (req, res) => {
    // إعداد CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const data = loadQuranData();
    
    if (!data) {
        return res.status(500).json({ error: 'السيرفر مش قادر يقرأ الملف' });
    }

    const { surah, ayah, juz, page, search } = req.query;

    try {
        // الحصول على سورة معينة
        if (surah) {
            const surahNum = parseInt(surah);
            if (surahNum < 1 || surahNum > 114) {
                return res.status(400).json({ error: 'رقم السورة غير صحيح' });
            }
            
            const surahData = data.surahs.find(s => s.id === surahNum);
            if (!surahData) {
                return res.status(404).json({ error: 'السورة غير موجودة' });
            }

            // إذا طلب آية معينة من السورة
            if (ayah) {
                const ayahNum = parseInt(ayah);
                const ayahData = surahData.ayahs.find(a => a.aya_no === ayahNum);
                if (!ayahData) {
                    return res.status(404).json({ error: 'الآية غير موجودة' });
                }
                return res.status(200).json({
                    surah: {
                        id: surahData.id,
                        name: surahData.name,
                        name_en: surahData.name_en
                    },
                    ayah: ayahData
                });
            }

            return res.status(200).json({
                id: surahData.id,
                name: surahData.name,
                name_en: surahData.name_en,
                ayah_count: surahData.ayah_count,
                revelation_type: surahData.revelation_type,
                ayahs: surahData.ayahs
            });
        }

        // الحصول على جزء معين
        if (juz) {
            const juzNum = parseInt(juz);
            if (juzNum < 1 || juzNum > 30) {
                return res.status(400).json({ error: 'رقم الجزء غير صحيح' });
            }

            const juzAyahs = [];
            data.surahs.forEach(surah => {
                surah.ayahs.forEach(ayah => {
                    if (ayah.juz === juzNum) {
                        juzAyahs.push({
                            surah_id: surah.id,
                            surah_name: surah.name,
                            ...ayah
                        });
                    }
                });
            });

            return res.status(200).json({
                juz: juzNum,
                ayah_count: juzAyahs.length,
                ayahs: juzAyahs
            });
        }

        // الحصول على صفحة معينة
        if (page) {
            const pageNum = parseInt(page);
            if (pageNum < 1 || pageNum > 604) {
                return res.status(400).json({ error: 'رقم الصفحة غير صحيح' });
            }

            const pageAyahs = [];
            data.surahs.forEach(surah => {
                surah.ayahs.forEach(ayah => {
                    if (ayah.page === pageNum) {
                        pageAyahs.push({
                            surah_id: surah.id,
                            surah_name: surah.name,
                            ...ayah
                        });
                    }
                });
            });

            return res.status(200).json({
                page: pageNum,
                ayahs: pageAyahs
            });
        }

        // البحث في القرآن
        if (search) {
            const results = [];
            const searchTerm = search.trim();
            
            data.surahs.forEach(surah => {
                surah.ayahs.forEach(ayah => {
                    if (ayah.aya_text.includes(searchTerm) || ayah.aya_text_emlaey.includes(searchTerm)) {
                        results.push({
                            surah_id: surah.id,
                            surah_name: surah.name,
                            ...ayah
                        });
                    }
                });
            });

            return res.status(200).json({
                search: searchTerm,
                count: results.length,
                results: results.slice(0, 50) // أول 50 نتيجة
            });
        }

        // إرجاع قائمة السور
        const surahList = data.surahs.map(s => ({
            id: s.id,
            name: s.name,
            name_en: s.name_en,
            ayah_count: s.ayah_count,
            revelation_type: s.revelation_type
        }));

        return res.status(200).json({
            meta: data.meta,
            surahs: surahList
        });

    } catch (error) {
        console.error('خطأ:', error);
        return res.status(500).json({ error: 'حدث خطأ في المعالجة' });
    }
};
