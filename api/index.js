// Vercel Serverless Function - api.js
// ضع هذا الملف في مجلد /api على Vercel

const fs = require('fs');
const path = require('path');

// قراءة ملف البيانات
function getQuranData() {
    const filePath = path.join(process.cwd(), 'quran_data.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

export default function handler(req, res) {
    // السماح بالـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
        const quranData = getQuranData();
        const { surah, ayah, juz, page, search } = req.query;

        // 1. جلب سورة معينة
        if (surah) {
            const surahNum = parseInt(surah);
            if (surahNum >= 1 && surahNum <= 114) {
                const surahData = quranData.surahs[surahNum - 1];
                
                // إذا طلب آية معينة من السورة
                if (ayah) {
                    const ayahNum = parseInt(ayah);
                    const ayahData = surahData.ayahs.find(a => a.aya_no === ayahNum);
                    if (ayahData) {
                        return res.status(200).json({
                            success: true,
                            surah: {
                                id: surahData.id,
                                name: surahData.name,
                                name_en: surahData.name_en
                            },
                            ayah: ayahData
                        });
                    } else {
                        return res.status(404).json({ 
                            success: false, 
                            error: 'الآية غير موجودة' 
                        });
                    }
                }
                
                return res.status(200).json({
                    success: true,
                    id: surahData.id,
                    name: surahData.name,
                    name_en: surahData.name_en,
                    ayah_count: surahData.ayah_count,
                    revelation_type: surahData.revelation_type,
                    ayahs: surahData.ayahs
                });
            } else {
                return res.status(404).json({ 
                    success: false, 
                    error: 'السورة غير موجودة' 
                });
            }
        }

        // 2. جلب جزء معين
        if (juz) {
            const juzNum = parseInt(juz);
            if (juzNum >= 1 && juzNum <= 30) {
                const juzAyahs = [];
                quranData.surahs.forEach(surah => {
                    surah.ayahs.forEach(ayah => {
                        if (ayah.juz === juzNum) {
                            juzAyahs.push({
                                ...ayah,
                                surah_id: surah.id,
                                surah_name: surah.name
                            });
                        }
                    });
                });
                return res.status(200).json({
                    success: true,
                    juz: juzNum,
                    ayah_count: juzAyahs.length,
                    ayahs: juzAyahs
                });
            } else {
                return res.status(404).json({ 
                    success: false, 
                    error: 'الجزء غير موجود' 
                });
            }
        }

        // 3. جلب صفحة معينة
        if (page) {
            const pageNum = parseInt(page);
            if (pageNum >= 1 && pageNum <= 604) {
                const pageAyahs = [];
                quranData.surahs.forEach(surah => {
                    surah.ayahs.forEach(ayah => {
                        if (ayah.page === pageNum) {
                            pageAyahs.push({
                                ...ayah,
                                surah_id: surah.id,
                                surah_name: surah.name
                            });
                        }
                    });
                });
                return res.status(200).json({
                    success: true,
                    page: pageNum,
                    ayah_count: pageAyahs.length,
                    ayahs: pageAyahs
                });
            } else {
                return res.status(404).json({ 
                    success: false, 
                    error: 'الصفحة غير موجودة' 
                });
            }
        }

        // 4. بحث في النص
        if (search) {
            const results = [];
            const searchTerm = search.trim();
            quranData.surahs.forEach(surah => {
                surah.ayahs.forEach(ayah => {
                    if (ayah.aya_text.includes(searchTerm) || ayah.aya_text_emlaey.includes(searchTerm)) {
                        results.push({
                            surah_id: surah.id,
                            surah_name: surah.name,
                            aya_no: ayah.aya_no,
                            aya_text: ayah.aya_text,
                            aya_text_emlaey: ayah.aya_text_emlaey
                        });
                    }
                });
            });
            return res.status(200).json({
                success: true,
                search_term: searchTerm,
                results_count: results.length,
                results: results
            });
        }

        // 5. جلب قائمة السور (الافتراضي)
        const surahList = quranData.surahs.map(s => ({
            id: s.id,
            name: s.name,
            name_en: s.name_en,
            ayah_count: s.ayah_count,
            revelation_type: s.revelation_type
        }));

        return res.status(200).json({
            success: true,
            meta: quranData.meta,
            surahs: surahList
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'حدث خطأ في السيرفر',
            details: error.message 
        });
    }
}
