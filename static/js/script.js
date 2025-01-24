document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const drawingsContainer = document.getElementById('drawings-container');
    const aiBtn = document.getElementById('aiBtn');
    const themeBtn = document.getElementById('themeBtn');
    const aiResultBox = document.getElementById('aiResultBox');
    const aiResultContent = document.getElementById('aiResultContent');
    const closeAiResult = document.getElementById('closeAiResult');

    // Add reference to base URL
    const baseUrl = window.location.origin;

    // Set initial color based on theme
    colorPicker.value = "#ffffff";  // Start with white for dark theme
    let isDarkTheme = true;

    // Add loading state to buttons
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            button.disabled = false;
            button.innerHTML = button.id === 'saveBtn' ? 
                '<i class="fas fa-save"></i> Save' : 
                '<i class="fas fa-trash"></i> Clear';
        }
    }

    // Theme toggle function
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
        themeBtn.innerHTML = isDarkTheme ? 
            '<i class="fas fa-moon"></i> Theme' : 
            '<i class="fas fa-sun"></i> Theme';
        
        // Update canvas background and brush color
        ctx.fillStyle = isDarkTheme ? '#23272a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update brush color based on theme
        colorPicker.value = isDarkTheme ? '#ffffff' : '#000000';
    }

    // Add theme button listener
    themeBtn.addEventListener('click', toggleTheme);

    // Set initial canvas background
    function setCanvasBackground() {
        ctx.fillStyle = isDarkTheme ? '#23272a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Set canvas size
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();  // Maintain dark background after resize
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Drawing functions
    function draw(e) {
        if (!isDrawing) return;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSize.value;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    // Event listeners
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    // Update brush size display
    brushSize.addEventListener('input', () => {
        brushSizeValue.textContent = `${brushSize.value}px`;
    });

    // Enhanced clear canvas with confirmation
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            setButtonLoading(clearBtn, true);
            setTimeout(() => {
                setCanvasBackground();  // Use the function instead of direct color
                setButtonLoading(clearBtn, false);
            }, 500);
        }
    });

    // Enhanced save functionality with feedback and preview
    saveBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(saveBtn, true);
            
            // Create preview
            const timestamp = new Date().toLocaleTimeString();
            const previewDiv = document.createElement('div');
            previewDiv.className = 'drawing-preview';
            previewDiv.innerHTML = `
                <img src="${canvas.toDataURL()}" alt="Drawing at ${timestamp}">
                <div class="preview-time">${timestamp}</div>
            `;
            
            // Add preview to container
            drawingsContainer.insertBefore(previewDiv, drawingsContainer.firstChild);
            
            showNotification('Drawing saved to preview panel', 'success');
        } catch (error) {
            showNotification('Error saving drawing', 'error');
            console.error('Error:', error);
        } finally {
            setButtonLoading(saveBtn, false);
        }
    });

    // AI button handler
    aiBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(aiBtn, true);
            aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            const drawing = canvas.toDataURL();
            const response = await fetch(`${baseUrl}/ai-calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: drawing })
            });
            
            const data = await response.json();
            if (data.status === 'success') {
                aiResultContent.textContent = data.result;
                aiResultBox.classList.remove('hidden');
                showNotification('AI calculation complete!', 'success');
            } else {
                showNotification('AI calculation failed', 'error');
            }
        } catch (error) {
            showNotification('Error during AI calculation', 'error');
            console.error('Error:', error);
        } finally {
            setButtonLoading(aiBtn, false);
            aiBtn.innerHTML = '<i class="fas fa-brain"></i> AI Calculate';
        }
    });

    // Close AI result box
    closeAiResult.addEventListener('click', () => {
        aiResultBox.classList.add('hidden');
    });

    // Add notification system
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
});
