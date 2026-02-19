// Vercel Serverless Function - api.js
// معدل للعمل مع ملف quran_data.json

const fs = require('fs');
const path = require('path');

// قراءة ملف البيانات
function getQuranData() {
    try {
        // نجرب أماكن مختلفة للملف
        let filePath;
        
        // المكان الأول
        filePath = path.join(process.cwd(), 'quran_data.json');
        
        if (!fs.existsSync(filePath)) {
            // المكان الثاني
            filePath = path.join(process.cwd(), 'public', 'quran_data.json');
        }
        
        if (!fs.existsSync(filePath)) {
            // المكان الثالث
            filePath = path.join(__dirname, '..', 'quran_data.json');
        }
        
        console.log('Reading from:', filePath);
        
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', error.message);
        return null;
    }
}

export default function handler(req, res) {
    // السماح بالـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
        const data = getQuranData();
        
        // التحقق من وجود البيانات
        if (!data) {
            return res.status(500).json({ 
                success: false, 
                error: 'ملف البيانات غير موجود',
                hint: 'تأكد من رفع quran_data.json في المجلد الرئيسي'
            });
        }
        
        // التحقق من نوع البيانات (Array أو Object)
        let ayahs;
        if (Array.isArray(data)) {
            ayahs = data;
        } else if (data.surahs) {
            // لو الملف بالشكل القديم (مجمعة حسب السور)
            ayahs = [];
            data.surahs.forEach(surah => {
                surah.ayahs.forEach(ayah => {
                    ayahs.push({
                        ...ayah,
                        sura_no: surah.id,
                        sura_name_ar: surah.name,
                        sura_name_en: surah.name_en
                    });
                });
            });
        } else {
            return res.status(500).json({ 
                success: false, 
                error: 'شكل ملف البيانات غير صحيح',
                data_type: typeof data
            });
        }
        
        const { surah, ayah, juz, page, search } = req.query;

        // 1. جلب سورة معينة
        if (surah) {
            const surahNum = parseInt(surah);
            if (surahNum >= 1 && surahNum <= 114) {
                const surahAyahs = ayahs.filter(a => a.sura_no === surahNum || a.surah_id === surahNum);
                
                if (surahAyahs.length === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        error: 'السورة غير موجودة',
                        surah_id: surahNum,
                        total_ayahs: ayahs.length
                    });
                }
                
                // ترتيب الآيات حسب رقمها
                surahAyahs.sort((a, b) => a.aya_no - b.aya_no);
                
                // إذا طلب آية معينة من السورة
                if (ayah) {
                    const ayahNum = parseInt(ayah);
                    const ayahData = surahAyahs.find(a => a.aya_no === ayahNum);
                    if (ayahData) {
                        return res.status(200).json({
                            success: true,
                            surah: {
                                id: surahNum,
                                name: surahAyahs[0].sura_name_ar || surahAyahs[0].surah_name,
                                name_en: surahAyahs[0].sura_name_en || surahAyahs[0].surah_name_en
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
                    id: surahNum,
                    name: surahAyahs[0].sura_name_ar || surahAyahs[0].surah_name,
                    name_en: surahAyahs[0].sura_name_en || surahAyahs[0].surah_name_en,
                    ayah_count: surahAyahs.length,
                    ayahs: surahAyahs
                });
            } else {
                return res.status(404).json({ 
                    success: false, 
                    error: 'رقم السورة يجب أن يكون بين 1 و 114' 
                });
            }
        }

        // 2. جلب جزء معين
        if (juz) {
            const juzNum = parseInt(juz);
            if (juzNum >= 1 && juzNum <= 30) {
                const juzAyahs = ayahs.filter(a => a.jozz === juzNum || a.juz === juzNum);
                juzAyahs.sort((a, b) => (a.id || a.aya_no_global) - (b.id || b.aya_no_global));
                
                return res.status(200).json({
                    success: true,
                    juz: juzNum,
                    ayah_count: juzAyahs.length,
                    ayahs: juzAyahs
                });
            } else {
                return res.status(404).json({ 
                    success: false, 
                    error: 'رقم الجزء يجب أن يكون بين 1 و 30' 
                });
            }
        }

        // 3. جلب صفحة معينة
        if (page) {
            const pageNum = parseInt(page);
            const pageAyahs = ayahs.filter(a => a.page === pageNum);
            pageAyahs.sort((a, b) => (a.id || a.aya_no_global) - (b.id || b.aya_no_global));
            
            return res.status(200).json({
                success: true,
                page: pageNum,
                ayah_count: pageAyahs.length,
                ayahs: pageAyahs
            });
        }

        // 4. بحث في النص
        if (search) {
            const searchTerm = search.trim();
            const results = ayahs.filter(a => 
                (a.aya_text_emlaey && a.aya_text_emlaey.includes(searchTerm)) ||
                (a.aya_text && a.aya_text.includes(searchTerm))
            );
            
            return res.status(200).json({
                success: true,
                search_term: searchTerm,
                results_count: results.length,
                results: results.slice(0, 50)
            });
        }

        // 5. جلب قائمة السور (الافتراضي)
        const surahList = [];
        for (let i = 1; i <= 114; i++) {
            const surahAyahs = ayahs.filter(a => a.sura_no === i || a.surah_id === i);
            if (surahAyahs.length > 0) {
                surahList.push({
                    id: i,
                    name: surahAyahs[0].sura_name_ar || surahAyahs[0].surah_name,
                    name_en: surahAyahs[0].sura_name_en || surahAyahs[0].surah_name_en,
                    ayah_count: surahAyahs.length
                });
            }
        }

        return res.status(200).json({
            success: true,
            total_ayahs: ayahs.length,
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
