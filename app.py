from flask import Flask, render_template, request, jsonify
import numpy as np
import base64
from dotenv import load_dotenv
import plotly.graph_objects as go
import re
import os
from pyfiles.geminicall import generate_content

app = Flask(__name__, 
    static_folder='static',
    template_folder='templates'
)
load_dotenv()

# Check if API key exists
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No API key found. Please set the GEMINI_API_KEY environment variable.")

@app.route('/')
def home():
    return render_template('index.html')  # Changed from calculator.html

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/graphing')
def graphing():
    return render_template('graphing.html')

@app.route('/matrix')
def matrix():
    return render_template('matrix.html')

@app.route('/converter')
def converter():
    return render_template('converter.html')

@app.route('/draw')
def draw():
    return render_template('draw.html')  # Add drawing page route

@app.route('/plot-function', methods=['POST'])
def plot_function():
    try:
        data = request.json
        function = data.get('function', 'x^2').replace('^', '**')
        x_range = data.get('xRange', [-10, 10])
        y_range = data.get('yRange', [-10, 10])
        
        x = np.linspace(x_range[0], x_range[1], 500)
        y = [eval(function.replace('x', str(i))) for i in x]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=x, y=y, mode='lines', name=function))
        fig.update_layout(
            title={'text': f'y = {function}', 'x': 0.5},
            xaxis_title='x',
            yaxis_title='y',
            showlegend=True,
            hovermode='x unified'
        )
        
        return jsonify({
            "status": "success",
            "plot": fig.to_json()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/matrix-calculate', methods=['POST'])
def matrix_calculate():
    try:
        data = request.json
        matrix_a = np.array(data.get('matrix_a'))
        matrix_b = np.array(data.get('matrix_b'))
        operation = data.get('operation')
        
        if operation == "Add":
            result = np.add(matrix_a, matrix_b)
        elif operation == "Multiply":
            result = np.dot(matrix_a, matrix_b)
        elif operation == "Transpose A":
            result = np.transpose(matrix_a)
            
        return jsonify({
            "status": "success",
            "result": result.tolist()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/convert-unit', methods=['POST'])
def convert_unit():
    try:
        data = request.json
        value = float(data.get('value', 0))
        unit_type = data.get('type')
        
        if unit_type == "Length":
            result = value * 3.28084
            response = f"{value} meters = {result:.2f} feet"
        elif unit_type == "Weight":
            result = value * 2.20462
            response = f"{value} kilograms = {result:.2f} pounds"
        elif unit_type == "Temperature":
            result = (value * 9/5) + 32
            response = f"{value}°C = {result:.2f}°F"
            
        return jsonify({
            "status": "success",
            "result": response
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/save', methods=['POST'])
def save_drawing():
    try:
        data = request.json
        image_data = data.get('image')
        # You can implement saving functionality here
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/ai-calculate', methods=['POST'])
def ai_calculate():
    try:
        data = request.json
        image_data = data.get('image')
        
        # Extract base64 image data
        image_data = re.sub('^data:image/.+;base64,', '', image_data)
        image_bytes = base64.b64decode(image_data)
        
        # Prepare prompt for mathematical analysis
        prompt = """You are a mathematical expert. Given this handwritten mathematical expression:
        1. First, identify what is written
        2. Then, solve it step by step
        3. Finally, provide the final answer
        
        Format your response clearly with:
        - Expression Identified: [what you see]
        - Step-by-step Solution: [numbered steps]
        - Final Answer: [result]

        Be precise and show all mathematical steps.
        do not  use * ** in your response"""
        
        # Generate response using geminicall
        response_text = generate_content(prompt, image_bytes)
        
        return jsonify({
            "status": "success",
            "result": response_text
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

def create_animated_heart():
    # Create base coordinates for heart shape
    x = np.linspace(-2, 2, 1000)
    frames = []
    
    # Create frames for animation with smooth transitions
    for t in np.linspace(0, 4*np.pi, 120):
        y = np.power(np.abs(x), 2/3) + 0.9 * np.sqrt(np.maximum(3.3 - x**2, 0)) * np.sin(t * np.pi * x)
        frames.append(go.Frame(data=[go.Scatter(
            x=x, 
            y=y, 
            mode='lines', 
            line=dict(
                color='red',
                width=3
            )
        )]))
    
    # Create initial figure
    fig = go.Figure(
        data=[frames[0].data[0]],
        frames=frames
    )
    
    # Enhanced layout configuration
    fig.update_layout(
        title={
            'text': "<span style='color: red;'>Animated Love Graph ❤️</span>",
            'y': 0.9,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top',
            'font': dict(size=24)
        },
        showlegend=False,
        xaxis_visible=False,
        yaxis_visible=False,
        plot_bgcolor='rgba(0,0,0,0)',
        width=1200,
        height=1000,
        margin=dict(l=20, r=20, t=60, b=20),
        updatemenus=[dict(
            type="buttons",
            showactive=False,
            x=0.5,
            y=1.1,
            xanchor="center",
            yanchor="top",
            pad=dict(t=0, r=0),
            buttons=[dict(
                label="▶ Play",
                method="animate",
                args=[None, dict(
                    frame=dict(duration=100, redraw=True),
                    fromcurrent=True,
                    mode='immediate',
                    transition=dict(duration=50),
                    loop=True
                )]
            )]
        )]
    )
    
    # Set axis ranges for better view
    fig.update_xaxes(range=[-4, 4])
    fig.update_yaxes(range=[-4, 4])
    
    return fig

@app.route('/plot-love-graph', methods=['POST'])
def plot_love_graph():
    try:
        fig = create_animated_heart()
        return jsonify({
            "status": "success",
            "plot": fig.to_json()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)
