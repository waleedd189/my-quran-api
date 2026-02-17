// كود بسيط لـ Node.js يشتغل على Vercel
module.exports = (req, res) => {
  const { surah } = req.query; // استلام رقم السورة من الرابط
  
  // هنا مثال لرد تجريبي، لاحقاً سنضع بيانات القرآن الحقيقية
  const data = {
    status: "success",
    message: `أنت تطلب بيانات السورة رقم ${surah || 'غير محددة'}`,
    developer: "جيمي"
  };

  res.status(200).json(data);
};
