document.addEventListener('DOMContentLoaded', function() {
    // Initialize plot with default settings
    plotFunction();
    
    // Add keyboard support
    document.getElementById('function').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            plotFunction();
        }
    });
});

function insertMathSymbol(symbol) {
    const functionInput = document.getElementById('function');
    const cursorPos = functionInput.selectionStart;
    const textBefore = functionInput.value.substring(0, cursorPos);
    const textAfter = functionInput.value.substring(cursorPos);
    functionInput.value = textBefore + symbol + textAfter;
    functionInput.focus();
    
    // Set cursor position after the inserted symbol
    const newPosition = cursorPos + symbol.length;
    functionInput.setSelectionRange(newPosition, newPosition);
}

function plotFunction() {
    const functionStr = document.getElementById('function').value || 'x^2';
    const xMin = parseFloat(document.getElementById('xMin').value);
    const xMax = parseFloat(document.getElementById('xMax').value);
    const yMin = parseFloat(document.getElementById('yMin').value);
    const yMax = parseFloat(document.getElementById('yMax').value);
    
    // Show loading state
    document.getElementById('plotBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Plotting...';
    
    fetch('/plot-function', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            function: functionStr,
            xRange: [xMin, xMax],
            yRange: [yMin, yMax]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const plotData = JSON.parse(data.plot);
            
            // Update layout with custom ranges
            plotData.layout.xaxis = { range: [xMin, xMax] };
            plotData.layout.yaxis = { range: [yMin, yMax] };
            plotData.layout.title.text = `y = ${functionStr}`;
            
            Plotly.newPlot('graph', plotData.data, plotData.layout);
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Error: ' + error, 'error');
    })
    .finally(() => {
        // Reset button state
        document.getElementById('plotBtn').innerHTML = '<i class="fas fa-play"></i> Plot Function';
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function switchTab(tab) {
    document.querySelectorAll('.graph-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.graph-tab[onclick*="${tab}"]`).classList.add('active');
    
    document.getElementById('functionPlot').style.display = tab === 'function' ? 'block' : 'none';
    document.getElementById('loveGraph').style.display = tab === 'love' ? 'block' : 'none';
    
    if (tab === 'love') {
        // Delay plotting so the container is visible and has computed dimensions
        requestAnimationFrame(() => {
            setTimeout(() => plotLoveGraph(), 100);
        });
    }
    
    // Resize any existing function plot when switching back
    if (tab === 'function') {
        const graphEl = document.getElementById('graph');
        if (graphEl && graphEl.data) {
            Plotly.Plots.resize(graphEl);
        }
    }
}

function plotLoveGraph() {
    const btn = document.getElementById('animateBtn');
    const plotEl = document.getElementById('loveGraphPlot');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    fetch('/plot-love-graph', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const plotData = JSON.parse(data.plot);
            
            // Override layout for proper sizing and visibility
            plotData.layout.autosize = true;
            plotData.layout.width = undefined;
            plotData.layout.height = undefined;
            plotData.layout.paper_bgcolor = 'rgba(0,0,0,0)';
            plotData.layout.plot_bgcolor = 'rgba(0,0,0,0)';
            
            const config = { responsive: true, displayModeBar: false };
            
            Plotly.newPlot(plotEl, plotData.data, plotData.layout, config).then(() => {
                // Force resize to fill the container
                Plotly.Plots.resize(plotEl);
                
                if (plotData.frames && plotData.frames.length > 0) {
                    Plotly.addFrames(plotEl, plotData.frames).then(() => {
                        Plotly.animate(plotEl, null, {
                            frame: { duration: 100, redraw: true },
                            fromcurrent: true,
                            mode: 'immediate',
                            transition: { duration: 50 }
                        });
                    });
                }
            });
            showNotification('Love graph animated! ❤️', 'success');
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Error: ' + error, 'error');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-heart"></i> Animate Love Graph';
    });
}
