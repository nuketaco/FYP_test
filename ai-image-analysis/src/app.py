# flask-backend/app.py
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import torch
from PIL import Image
import logging
from transformers import AutoProcessor, AutoModelForCausalLM
import io

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests from your React app

# Global variables for the model and processor
model = None
processor = None

def load_model():
    """Load the vision LLM model that fits within 8GB VRAM"""
    global model, processor
    
    try:
        logger.info("Loading vision model...")
        
        # Using LLaVA-1.5-7B which fits in 8GB VRAM with optimizations
        model_id = "llava-hf/llava-1.5-7b-hf"
        
        # Load with 8-bit quantization to reduce VRAM usage
        processor = AutoProcessor.from_pretrained(model_id)
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16,  # Use half precision
            device_map="auto",          # Automatically use available devices
            load_in_8bit=True,          # Enable 8-bit quantization
        )
        
        logger.info("Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def analyze_with_model(image_data):
    """Process image with the vision LLM model"""
    try:
        # Open image from binary data
        image = Image.open(io.BytesIO(image_data))
        
        # Prepare prompt - a simple question about the image
        prompt = "What's in this image? Please describe it in detail."
        
        # Process inputs
        inputs = processor(prompt, image, return_tensors="pt").to(model.device)
        
        # Generate with reduced memory usage settings
        generation_config = {
            "max_new_tokens": 256,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True
        }
        
        # Generate response with optimized memory settings
        with torch.inference_mode():
            outputs = model.generate(
                **inputs,
                **generation_config
            )
        
        # Decode the generated text
        generated_text = processor.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the model's response (remove the prompt)
        response = generated_text.split(prompt)[-1].strip()
        
        return {"analysis": response}
    except Exception as e:
        logger.error(f"Error during image analysis: {str(e)}")
        return {"error": str(e)}

@app.route('/analyze', methods=['POST'])
def analyze_image():
    # Check if model is loaded
    global model
    if model is None:
        success = load_model()
        if not success:
            return jsonify({"error": "Failed to load AI model"}), 500
    
    # Get image from request
    image = request.files.get('image')
    if not image:
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        # Read image data
        image_data = image.read()
        
        # Analyze the image
        result = analyze_with_model(image_data)
        
        # Check if there was an error during analysis
        if "error" in result:
            return jsonify({"error": result["error"]}), 500
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint to check if the server is running and model is loaded"""
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })
    
@app.route('/test', methods=['GET'])
def test_connection():
    """Simple endpoint to test if the backend is reachable"""
    return jsonify({
        "status": "success",
        "message": "Flask backend is connected!",
        "timestamp": datetime.now().isoformat()
    })   

if __name__ == '__main__':
    # Load model at startup (optional, can also load on first request)
    load_model()
    
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app with threading enabled for better handling of concurrent requests
    app.run(host='0.0.0.0', port=port, threaded=True)