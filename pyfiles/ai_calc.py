import streamlit as st
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Initialize Gemini API
def init_gemini():
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        st.error("Please set GEMINI_API_KEY in .env file")
        return None
        
    genai.configure(api_key=api_key)
    
    # Configure model settings
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 2048,
    }
    
    return genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config
    )

def get_ai_response(model, prompt):
    try:
        prompt_template = f"""
        Act as a mathematical expert. For the following mathematical problem:
        {prompt}
        
        Please provide:
        1. Step-by-step solution with clear explanations
        2. The final answer clearly marked
        3. Any relevant mathematical properties or rules used
        
        Keep the response concise but thorough.
        """
        
        if not model:
            return "Error: Gemini API not properly initialized"
            
        response = model.generate_content(prompt_template)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def show_ai_calculator():
    st.title("AI Calculator")
    
    # CSS for better text input styling
    st.markdown("""
        <style>
        .stTextArea textarea {
            font-size: 18px;
            font-family: monospace;
            height: 150px;
            border-radius: 10px;
            padding: 10px;
        }
        </style>
    """, unsafe_allow_html=True)
    
    # Initialize model if not already done
    if 'gemini_model' not in st.session_state:
        st.session_state.gemini_model = init_gemini()
    
    # Input area
    equation = st.text_area(
        "Enter your mathematical problem:",
        placeholder="Examples:\n1. Solve 2x + 5 = 13\n2. Find the derivative of x^2 * sin(x)\n3. Calculate the area of a circle with radius 5",
        help="You can enter equations, word problems, or any mathematical questions"
    )
    
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        if st.button("Solve", use_container_width=True, type="primary"):
            if equation:
                with st.spinner("Thinking... 🤔"):
                    result = get_ai_response(st.session_state.gemini_model, equation)
                    st.markdown("### Solution")
                    st.markdown(result)
            else:
                st.warning("Please enter a mathematical problem")

if __name__ == "__main__":
    st.set_page_config(page_title="AI Calculator", layout="wide")
    show_ai_calculator()
