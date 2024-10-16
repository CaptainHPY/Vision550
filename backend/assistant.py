import base64
from threading import Lock, Thread

import os
from cv2 import VideoCapture, imencode
from dotenv import load_dotenv
from speech_recognition import Recognizer, UnknownValueError, AudioFile
from openai import OpenAI
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
import io

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})

class WebcamStream:
    def __init__(self):
        self.stream = VideoCapture(index=0)
        _, self.frame = self.stream.read()
        self.running = False
        self.lock = Lock()

    def start(self):
        if self.running:
            return self

        self.running = True

        self.thread = Thread(target=self.update, args=())
        self.thread.start()
        return self

    def update(self):
        while self.running:
            _, frame = self.stream.read()

            self.lock.acquire()
            self.frame = frame
            self.lock.release()

    def read(self, encode=False):
        self.lock.acquire()
        frame = self.frame.copy()
        self.lock.release()

        if encode:
            _, buffer = imencode(".jpeg", frame)
            return base64.b64encode(buffer)

        return frame

    def stop(self):
        self.running = False
        if self.thread.is_alive():
            self.thread.join()

    def __exit__(self, exc_type, exc_value, exc_traceback):
        self.stream.release()


class Assistant:
    def __init__(self):
        self.model = "gemini-1.5-flash"
        self.client = OpenAI(base_url=os.getenv("BASE_URL"), api_key=os.getenv("API_KEY"))

    def answer(self, prompt, image):
        if not prompt:
            return

        print("Prompt:", prompt)
        image_decoded = image.decode()

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "你是一个机智的助手，依据用户提供的聊天记录和图片回答问题。回答时简明扼要，直奔主题。注意不要使用emoji以及问用户问题。友善待人，乐于助人，可以展现一点个性，但不要太正式。"
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": 
                            {
                                "url": f"data:image/jpeg;base64,{image_decoded}"
                            },
                        },
                    ],
                }
            ],
        )

        response = response.choices[0].message.content.strip()
        print("Response:", response)

        return response

assistant = Assistant()
recognizer = Recognizer()
webcam_stream = None

@app.route('/api/start_webcam', methods=['POST'])
def start_webcam():
    global webcam_stream
    if webcam_stream is None or not webcam_stream.running:
        webcam_stream = WebcamStream().start()
    return jsonify({'status': 'success', 'message': '摄像头已启动'})

@app.route('/api/get_camera_frame', methods=['GET'])
def get_camera_frame():
    global webcam_stream
    if webcam_stream and webcam_stream.running:
        frame = webcam_stream.read(encode=True)
        if frame is not None:
            return jsonify({'status': 'success', 'frame': frame.decode('utf-8')})
    return jsonify({'status': 'error', 'message': '无法获取摄像头帧'}), 400

@app.route('/api/recognize_speech', methods=['POST'])
def recognize_speech():
    audio_file = request.files['audio']
    try:
        audio_path = 'received_audio.wav'
        audio_file.save(audio_path)

        with AudioFile(audio_path) as source:
            audio = recognizer.record(source)
        
        text = recognizer.recognize_whisper(audio, model="base", language="chinese")
        return jsonify({'text': text})
    except UnknownValueError:
        return jsonify({'error': '无法识别语音'}), 400
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

@app.route('/api/call_assistant', methods=['POST'])
def call_assistant():
    prompt = request.json.get('prompt', '')

    if webcam_stream and webcam_stream.running:
        image = webcam_stream.read(encode=True)
    else:
        return jsonify({'error': '摄像头未启动'}), 400

    text_response = assistant.answer(prompt, image)
    
    encoded_text_response = base64.b64encode(text_response.encode('utf-8')).decode('ascii')
    
    audio_response = assistant.client.audio.speech.create(
        model="tts-1",
        voice="onyx",
        response_format="mp3",
        input=text_response
    )
    
    audio_data = io.BytesIO(audio_response.content)
    audio_data.seek(0)
    
    response = make_response(send_file(
        audio_data, 
        mimetype="audio/mpeg", 
        as_attachment=True, 
        download_name="response.mp3"
    ))
    response.headers['X-Text-Response'] = encoded_text_response
    
    return response

@app.route('/api/stop_webcam', methods=['POST'])
def stop_webcam():
    global webcam_stream
    if webcam_stream and webcam_stream.running:
        webcam_stream.stop()
        webcam_stream = None
    return jsonify({'status': 'success', 'message': '摄像头已关闭'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
