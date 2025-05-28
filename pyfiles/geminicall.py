import requests
import json
import os
import base64
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def generate_content(prompt, image_data=None):
    """
    Generate content using Gemini API
    
    Args:
        prompt (str): Text prompt for the AI
        image_data (bytes, optional): Image data for multimodal input
    
    Returns:
        str: Generated text response
    """
    # Get API key from environment variable
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    # API endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    # Request headers
    headers = {
        'Content-Type': 'application/json'
    }
    
    # Prepare parts for the request
    parts = [{"text": prompt}]
    
    # Add image if provided
    if image_data:
        # Convert image bytes to base64
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        parts.append({
            "inline_data": {
                "mime_type": "image/png",
                "data": image_b64
            }
        })
    
    # Request payload
    data = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "temperature": 1,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 8192
        }
    }
    
    try:
        # Make the API request
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        # Parse the response and extract just the text
        result = response.json()
        text_content = result['candidates'][0]['content']['parts'][0]['text']
        return text_content.strip()
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error making API request: {e}")
    except (KeyError, IndexError) as e:
        raise Exception(f"Error parsing response: {e}")

def test_gemini_api():
    """Test function for basic text generation"""
    try:
        response = generate_content("Explain how AI works in a few words")
        print(response)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gemini_api()