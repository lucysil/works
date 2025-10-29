from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_NAME = "Lucysil/my-tinyllama-lora-chatbot"
HF_API_URL = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"

app = Flask(__name__)
CORS(app)

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.json
        prompt = data.get("prompt", "")
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        payload = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 100, "temperature": 0.8, "top_p": 0.95}
        }

        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)

        # 🔴 여기에 Hugging Face 응답 전체 로그 추가
        print("🔹 Status Code:", response.status_code)
        print("🔹 Raw Response:", response.text)

        if response.status_code != 200:
            return jsonify({"error": f"Inference API error: {response.text}"}), 500

        result = response.json()
        if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
            text = result[0]["generated_text"]
        elif isinstance(result, dict) and "generated_text" in result:
            text = result["generated_text"]
        else:
            text = str(result)

        return jsonify({"response": text}), 200

    except Exception as e:
        print("❌ Flask 내부 에러:", e)
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(port=5000)
