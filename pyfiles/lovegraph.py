import numpy as np
import plotly.graph_objects as go

def create_animated_heart():
    # Create base coordinates
    x = np.linspace(-2, 2, 1000)
    frames = []
    
    # Create frames for animation with more frames and slower speed
    for t in np.linspace(0, 4*np.pi, 120):  # Doubled number of frames for smoother animation
        y = np.power(np.abs(x), 2/3) + 0.9 * np.sqrt(np.maximum(3.3 - x**2, 0)) * np.sin(t * np.pi * x)
        frames.append(go.Frame(data=[go.Scatter(x=x, y=y, mode='lines', line=dict(color='red', width=3))]))
    
    # Create the initial figure with larger size
    fig = go.Figure(
        data=[frames[0].data[0]],
        frames=frames
    )
    
    # Update layout with larger size and settings
    fig.update_layout(
        title={
            'text': "<span style='color: red;'>Animated Love Graph ❤️</span>",  # Added color to title
            'y': 0.9,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top',
            'font': dict(size=24)
        },
        showlegend=False,
        xaxis_visible=False,
        yaxis_visible=False,
        plot_bgcolor='white',
        width=1200,  # Increased width further
        height=1000,  # Increased height further
        margin=dict(l=20, r=20, t=60, b=20),  # Reduced margins for more space
        updatemenus=[dict(
            type="buttons",
            showactive=False,
            x=0.5,     # Center horizontally
            y=1.1,     # Move above the title
            xanchor="center",
            yanchor="top",
            pad=dict(t=0, r=0),
            buttons=[dict(
                label="▶ Play",  # Added play symbol
                method="animate",
                args=[None, dict(
                    frame=dict(duration=100, redraw=True),  # Increased duration for slower animation
                    fromcurrent=True,
                    mode='immediate',
                    transition=dict(duration=50),  # Added transition duration
                    loop=True  # Enable looping
                )]
            )]
        )],
        # Removed sliders section completely
    )
    
    # Adjust axes ranges for even larger view
    fig.update_xaxes(range=[-4, 4])  # Increased range
    fig.update_yaxes(range=[-4, 4])  # Increased range
    
    return fig

if __name__ == "__main__":
    create_animated_heart()
