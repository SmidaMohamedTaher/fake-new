// script.js

document.getElementById('check-button').addEventListener('click', function() {
    const newsText = document.getElementById('news-text').value.trim();
    const statusMessage = document.getElementById('status-message');

    // 1. التحقق من أن النص غير فارغ
    if (newsText === "") {
        statusMessage.textContent = "الرجاء إدخال نص الخبر للمتابعة.";
        statusMessage.className = ''; 
        return;
    }

    // 2. حالة "جاري التحقق..."
    statusMessage.textContent = "جاري تحليل النص والتحقق من صحته...";
    statusMessage.className = 'loading';

    // 3. إرسال النص إلى API باستخدام دالة fetch()

    // ملاحظة: بما أنك تشغل Flask API محلياً، فإن العنوان هو http://127.0.0.1:5000/predict
    const apiUrl = "http://127.0.0.1:5000/predict"; 
    
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newsText }) // إرسال النص كجسم JSON
    })
    .then(response => {
        // التحقق من حالة الاستجابة
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // تحويل الاستجابة إلى JSON
    })
    .then(data => {
        // 4. معالجة النتيجة وعرضها
        const result = data.prediction; // النتيجة المسترجعة من الـ API (Fake أو Not Fake)

        if (result === 'Not Fake') {
            statusMessage.textContent = "✅ الخبر حقيقي وموثوق به.";
            statusMessage.className = 'real-news';
        } else if (result === 'Fake') {
            statusMessage.textContent = "❌ تنبيه: هذا الخبر قد يكون ملفقاً أو مضللاً.";
            statusMessage.className = 'fake-news';
        } else {
            statusMessage.textContent = `النتيجة غير متوقعة: ${result}`;
            statusMessage.className = '';
        }
    })
    .catch(error => {
        // 5. معالجة الأخطاء (مثل عدم تشغيل السيرفر أو مشاكل الشبكة)
        console.error('Error sending data to API:', error);
        statusMessage.textContent = "⚠️ خطأ في الاتصال بالخادم. تأكد من أن سيرفر Flask يعمل.";
        statusMessage.className = 'fake-news'; // استخدام تنسيق الخطأ
    });
});