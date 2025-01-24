import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

def animate_heart():
    fig = plt.figure(figsize=(8, 8))
    ax = fig.add_subplot(111)
    ax.set_xlim([-3, 3])
    ax.set_ylim([-3, 3])
    
    x = np.linspace(-2, 2, 1000)
    line, = ax.plot([], [], 'r-', linewidth=2)
    ax.set_axis_off()
    
    def init():
        line.set_data([], [])
        return line,
    
    def animate(frame):
        # Create heart curve with animation parameter
        t = frame * 0.2  # Animation speed control
        y = np.power(np.abs(x), 2/3) + 0.9 * np.sqrt(np.maximum(3.3 - x**2, 0)) * np.sin(t * np.pi * x)
        
        line.set_data(x, y)
        ax.set_title("Python ❤️", fontsize=20, pad=20)
        return line,
    
    anim = FuncAnimation(fig, animate, init_func=init, frames=100,
                        interval=50, blit=True, repeat=True)
    plt.show()

if __name__ == "__main__":
    animate_heart()
