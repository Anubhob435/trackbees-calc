import streamlit as st
import numpy as np

def show_scientific_calculator():
    # CSS styling for compact buttons
    st.markdown("""
        <style>
        .stButton button {
            width: 100%;
            padding: 15px 5px;
            margin: 2px 0px;
            font-size: 16px;
        }
        div.row-widget.stButton {
            margin: 0px 0px;
            padding: 2px 2px;
        }
        </style>
    """, unsafe_allow_html=True)
    
    st.title("Scientific Calculator")
    
    if 'calc_display' not in st.session_state:
        st.session_state.calc_display = ''
    
    # Display
    display = st.text_input("Expression:", st.session_state.calc_display, key='calc_input')
    
    # Calculator layout
    with st.container():
        # Scientific functions row 1
        cols = st.columns([1,1,1,1,1])
        scientific_buttons1 = [
            ('sin', 'np.sin('), ('cos', 'np.cos('), ('tan', 'np.tan('),
            ('log', 'np.log10('), ('ln', 'np.log(')
        ]
        for i, (col, (btn, val)) in enumerate(zip(cols, scientific_buttons1)):
            with col:
                if st.button(btn, key=f'sci_{btn}'):
                    st.session_state.calc_display += val

        # Scientific functions row 2
        cols = st.columns([1,1,1,1,1])
        scientific_buttons2 = [
            ('√', 'np.sqrt('), ('π', 'np.pi'), ('e', 'np.e'),
            ('(', '('), (')', ')')
        ]
        for i, (col, (btn, val)) in enumerate(zip(cols, scientific_buttons2)):
            with col:
                if st.button(btn, key=f'sci2_{btn}'):
                    st.session_state.calc_display += val

        # Number pad and operations
        button_layout = [
            ['7', '8', '9', '/'],
            ['4', '5', '6', '*'],
            ['1', '2', '3', '-'],
            ['0', '.', 'DEL', '+']
        ]

        for i, row in enumerate(button_layout):
            cols = st.columns([1,1,1,1])
            for j, (col, btn) in enumerate(zip(cols, row)):
                with col:
                    if st.button(btn, key=f'btn_{i}_{j}'):
                        if btn == 'DEL':
                            st.session_state.calc_display = st.session_state.calc_display[:-1]
                        else:
                            st.session_state.calc_display += btn

        # Bottom row
        cols = st.columns([2,2])
        with cols[0]:
            if st.button('CLEAR', key='clear', use_container_width=True):
                st.session_state.calc_display = ''
        with cols[1]:
            if st.button('=', key='calculate', use_container_width=True):
                try:
                    st.session_state.calc_display = str(eval(st.session_state.calc_display))
                except Exception as e:
                    st.error(f"Error: {str(e)}")