# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from transformers import AutoModelForCausalLM, AutoTokenizer
# import torch

# HF_TOKEN = "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"


# base_model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# tokenizer = AutoTokenizer.from_pretrained(base_model_name, token=HF_TOKEN)
# model = AutoModelForCausalLM.from_pretrained(
#     base_model_name,
#     torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
#     token=HF_TOKEN
# )

# model.eval()

# app = Flask(__name__)
# CORS(app)   # Flask 앱 생성 바로 다음 줄에 추가

# @app.route("/generate", methods=["POST"])
# def generate():
#     data = request.json
#     prompt = data.get("prompt", "")
#     if not prompt:
#         return jsonify({"error": "No prompt provided"}), 400

#     inputs = tokenizer(prompt, return_tensors="pt")
#     outputs = model.generate(
#         **inputs,
#         max_new_tokens=100,
#         do_sample=True,
#         top_p=0.95,
#         temperature=0.8
#     )
#     result = tokenizer.decode(outputs[0], skip_special_tokens=True)
#     return jsonify({"response": result})

# if __name__ == "__main__":
#     app.run(port=5000)

# works/server/flask/app.py
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os


# Hugging Face API 정보
HF_TOKEN = os.getenv("HF_TOKEN")  # 환경변수로 설정 (export HF_TOKEN="hf_xxx")
MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
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

        # Hugging Face Inference API 호출
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        payload = {"inputs": prompt, "parameters": {"max_new_tokens": 100, "temperature": 0.8, "top_p": 0.95}}
        
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            return jsonify({"error": f"Inference API error: {response.text}"}), 500
        
        result = response.json()
        # 응답 형식이 문자열 또는 dict로 올 수 있음
        if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
            text = result[0]["generated_text"]
        elif isinstance(result, dict) and "generated_text" in result:
            text = result["generated_text"]
        else:
            text = str(result)
        
        return jsonify({"response": text}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(port=5000)
