import streamlit as st
import numpy as np
import plotly.graph_objects as go
from lovegraph import create_animated_heart
from scalc import show_scientific_calculator
from ai_calc import show_ai_calculator

def main():
    st.set_page_config(page_title="Trackbeez Calculator", layout="wide")
    
    # Add title and subtitle with custom styling
    st.markdown("""
        <style>
        .main-title {
            color: #4a90e2;
            font-size: 3em;
            font-weight: bold;
            text-align: center;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .subtitle {
            color: #666;
            font-size: 1.2em;
            text-align: center;
            margin-top: 0;
            padding-top: 0;
            margin-bottom: 2em;
        }
        </style>
        <h1 class="main-title">Trackbeez Calc</h1>
        <p class="subtitle">An interactive and responsive calculator app</p>
    """, unsafe_allow_html=True)
    
    # Initialize session state for current page if it doesn't exist
    if 'current_page' not in st.session_state:
        st.session_state.current_page = "Normal Calculator"
    
    # Sidebar navigation with buttons
    st.sidebar.title("Calculator Options")
    
    # Add custom CSS to style sidebar buttons
    st.markdown("""
        <style>
        .sidebar-button {
            width: 100%;
            margin: 5px 0;
            padding: 10px;
        }
        </style>
    """, unsafe_allow_html=True)
    
    # Navigation buttons
    if st.sidebar.button("Scientific Calculator", key="sci_calc", use_container_width=True):
        st.session_state.current_page = "Normal Calculator"
    if st.sidebar.button("Graphing Calculator", key="graph_calc", use_container_width=True):
        st.session_state.current_page = "Graphing Calculator"
    if st.sidebar.button("Matrix Calculator", key="matrix_calc", use_container_width=True):
        st.session_state.current_page = "Matrix Calculator"
    if st.sidebar.button("Unit Converter", key="unit_conv", use_container_width=True):
        st.session_state.current_page = "Unit Converter"
    if st.sidebar.button("AI Calculator", key="ai_calc", use_container_width=True):
        st.session_state.current_page = "AI Calculator"

    # Display current page based on session state
    if st.session_state.current_page == "Normal Calculator":
        show_scientific_calculator()
    elif st.session_state.current_page == "Graphing Calculator":
        graphing_page()
    elif st.session_state.current_page == "Matrix Calculator":
        matrix_page()
    elif st.session_state.current_page == "Unit Converter":
        converter_page()
    elif st.session_state.current_page == "AI Calculator":
        show_ai_calculator()

def calculator_page():
    st.title("Scientific Calculator")
    # Basic calculator functionality would need to be implemented differently
    # since Streamlit is stateless and doesn't support direct JavaScript interactions
    expression = st.text_input("Enter expression")
    if st.button("Calculate"):
        try:
            result = eval(expression)
            st.success(f"Result: {result}")
        except:
            st.error("Invalid expression")

def graphing_page():
    st.title("Graphing Calculator")
    
    # Create tabs for different graph types
    tab1, tab2 = st.tabs(["Function Plotter", "Love Graph"])
    
    with tab1:
        function = st.text_input("Enter function (use x as variable)", "x**2")
        if st.button("Plot Function"):
            try:
                x = np.linspace(-10, 10, 200)
                y = [eval(function.replace('x', str(i))) for i in x]
                fig = go.Figure()
                fig.add_trace(go.Scatter(x=x, y=y, mode='lines'))
                fig.update_layout(title=f'y = {function}')
                st.plotly_chart(fig)
            except:
                st.error("Invalid function")
    
    with tab2:
        # Add some vertical space
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("Show Animated Heart ❤️"):
            fig = create_animated_heart()
            # Increase container height and use full width
            st.plotly_chart(fig, use_container_width=True, height=1000)

def matrix_page():
    st.title("Matrix Calculator")
    
    st.subheader("Matrix A")
    matrix_a = st.text_area("Enter Matrix A (comma-separated values, one row per line)", "1,2,3\n4,5,6")
    
    st.subheader("Matrix B")
    matrix_b = st.text_area("Enter Matrix B (comma-separated values, one row per line)", "7,8,9\n10,11,12")
    
    operation = st.selectbox("Choose Operation", ["Add", "Multiply", "Transpose A"])
    
    if st.button("Calculate"):
        try:
            matrix_a = parse_matrix(matrix_a)
            matrix_b = parse_matrix(matrix_b)
            
            if operation == "Add":
                result = np.add(matrix_a, matrix_b)
            elif operation == "Multiply":
                result = np.dot(matrix_a, matrix_b)
            elif operation == "Transpose A":
                result = np.transpose(matrix_a)
                
            st.subheader("Result:")
            st.write(result)
        except Exception as e:
            st.error(f"Error: {str(e)}")

def converter_page():
    st.title("Unit Converter")
    
    conversion_type = st.selectbox("Select Conversion Type", ["Length", "Weight", "Temperature"])
    
    if conversion_type == "Length":
        meters = st.number_input("Enter length in meters")
        feet = meters * 3.28084
        st.write(f"{meters} meters = {feet:.2f} feet")
        
    elif conversion_type == "Weight":
        kg = st.number_input("Enter weight in kilograms")
        pounds = kg * 2.20462
        st.write(f"{kg} kilograms = {pounds:.2f} pounds")
        
    elif conversion_type == "Temperature":
        celsius = st.number_input("Enter temperature in Celsius")
        fahrenheit = (celsius * 9/5) + 32
        st.write(f"{celsius}°C = {fahrenheit:.2f}°F")

def parse_matrix(matrix_str):
    return np.array([list(map(float, row.split(','))) for row in matrix_str.splitlines() if row])

if __name__ == '__main__':
    main()