from flask import Flask, request, jsonify
import joblib
import re

# إنشاء التطبيق
app = Flask(__name__)

# تحميل النموذج و TF-IDF
model = joblib.load("random_forest_model_arabic.pkl")
tfidf = joblib.load("tfidf_arabic.pkl")

# دالة تنظيف النصوص العربية
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)   # إزالة الروابط
    text = re.sub(r"[^ء-ي\s]", " ", text)        # إزالة أي رموز غير الحروف والمسافات
    text = re.sub(r"\s+", " ", text)             # دمج المسافات المتعددة
    return text.strip()

# endpoint للتنبؤ
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    texts = data["text"]
    # إذا كان نص واحد فقط، ضع في قائمة
    if isinstance(texts, str):
        texts = [texts]

    # تنظيف النصوص
    texts_clean = [preprocess_text(t) for t in texts]

    # تحويل إلى TF-IDF
    texts_tfidf = tfidf.transform(texts_clean)

    # التنبؤ
    predictions = model.predict(texts_tfidf)
    labels = ["Fake" if p == 1 else "Not Fake" for p in predictions]

    # إرجاع النتائج
    return jsonify({"predictions": labels})

# تشغيل السيرفر
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
