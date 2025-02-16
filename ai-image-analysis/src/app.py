# flask-backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests from your React app

@app.route('/analyze', methods=['POST'])
def analyze_image():
    image = request.files.get('image')
    if image:
        # Here, add your AI image analysis code.
        # For demonstration, we just return a dummy response.
        return jsonify({'result': 'Image analyzed successfully'})
    return jsonify({'error': 'No image provided'}), 400

if __name__ == '__main__':
    app.run(port=5000)
