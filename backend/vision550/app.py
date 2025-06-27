import os
import io
import base64
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from speech_recognition import Recognizer, UnknownValueError, AudioFile

from vision550.webcam import WebcamStream
from vision550.assistant import Assistant
from vision550.config_loader import config

class ApiServer:
    def __init__(self, webcam_stream=None, latest_image=None):
        self.app = Flask(__name__)
        CORS(self.app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})
        self.recognizer = Recognizer()
        self.webcam_stream = webcam_stream
        self.latest_image = latest_image
        
        self._register_routes()
    
    def _register_routes(self):
        self.app.route('/api/start_webcam', methods=['POST'])(self.start_webcam)
        self.app.route('/api/get_camera_frame', methods=['GET'])(self.get_camera_frame)
        self.app.route('/api/recognize_data', methods=['POST'])(self.recognize_data)
        self.app.route('/api/call_assistant', methods=['POST'])(self.call_assistant)
        self.app.route('/api/stop_webcam', methods=['POST'])(self.stop_webcam)
        
    def start_webcam(self):
        if self.webcam_stream is None or not self.webcam_stream.running:
            self.webcam_stream = WebcamStream().start()
        return jsonify({'status': 'success', 'message': '摄像头已启动'})

    def get_camera_frame(self):
        if self.webcam_stream and self.webcam_stream.running:
            frame = self.webcam_stream.read(encode=True)
            if frame is not None:
                return jsonify({'status': 'success', 'frame': frame.decode('utf-8')})
        return jsonify({'status': 'error', 'message': '无法获取摄像头帧'}), 400

    def recognize_data(self):
        audio_file = request.files['audio']
        try:
            if self.webcam_stream and self.webcam_stream.running:
                self.latest_image = self.webcam_stream.read(encode=True)
            else:
                return jsonify({'error': '摄像头未启动'}), 400

            audio_path = 'received_audio.wav'
            audio_file.save(audio_path)

            model_config = config.get_model_config()
            whisper_model = model_config.get('whisper', 'base')
            whisper_language = model_config.get('whisper_language', 'chinese')

            with AudioFile(audio_path) as source:
                audio = self.recognizer.record(source)
            
            text = self.recognizer.recognize_whisper(
                audio, 
                model=whisper_model, 
                language=whisper_language
            )
            return jsonify({'text': text})
        except UnknownValueError:
            return jsonify({'error': '无法识别语音'}), 400
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)

    def call_assistant(self):
        prompt = request.json.get('prompt', '')
        api_key = request.headers.get('X-API-Key')

        assistant = Assistant(api_key)

        if self.latest_image is None:
            return jsonify({'error': '没有可用的图像'}), 400

        text_response = assistant.answer(prompt, self.latest_image)
        
        encoded_text_response = base64.b64encode(text_response.encode('utf-8')).decode('ascii')
        
        model_config = config.get_model_config()
        tts_model = model_config.get('tts', 'tts-1')
        tts_voice = model_config.get('tts_voice', 'onyx')
        
        audio_response = assistant.client.audio.speech.create(
            model=tts_model,
            voice=tts_voice,
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

    def stop_webcam(self):
        if self.webcam_stream and self.webcam_stream.running:
            self.webcam_stream.stop()
            self.webcam_stream = None
        return jsonify({'status': 'success', 'message': '摄像头已关闭'})
    
    def run(self):
        app_config = config.get_app_config()
        host = app_config.get('host', '0.0.0.0')
        port = app_config.get('port', 8080)
        debug = app_config.get('debug', True)
        self.app.run(debug=debug, host=host, port=port)