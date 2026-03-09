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

    const baseUrl = window.location.origin;

    // Detect current theme
    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // Set initial color based on theme
    colorPicker.value = isDark() ? "#ffffff" : "#000000";

    // Loading state
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

    // Canvas theme toggle (draw page theme btn)
    function toggleCanvasTheme() {
        const dark = isDark();
        const next = dark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        themeBtn.innerHTML = next === 'dark' ? 
            '<i class="fas fa-sun"></i> Theme' : 
            '<i class="fas fa-moon"></i> Theme';
        
        // Update canvas background & brush color
        ctx.fillStyle = next === 'dark' ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        colorPicker.value = next === 'dark' ? '#ffffff' : '#000000';

        // Also sync the sidebar theme toggle if present
        const sidebarToggle = document.getElementById('themeToggle');
        if (sidebarToggle) {
            const icon = sidebarToggle.querySelector('i');
            const label = sidebarToggle.querySelector('span');
            icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            label.textContent = next === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
    }

    themeBtn.addEventListener('click', toggleCanvasTheme);

    // Set initial btn text
    themeBtn.innerHTML = isDark() ? 
        '<i class="fas fa-sun"></i> Theme' : 
        '<i class="fas fa-moon"></i> Theme';

    // Set canvas background based on theme
    function setCanvasBackground() {
        ctx.fillStyle = isDark() ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Resize canvas
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function getPos(e) {
        if (e.touches && e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return { x: e.offsetX, y: e.offsetY };
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSize.value;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        lastX = pos.x;
        lastY = pos.y;
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', () => isDrawing = false);
    canvas.addEventListener('touchcancel', () => isDrawing = false);

    // Brush size display
    brushSize.addEventListener('input', () => {
        brushSizeValue.textContent = `${brushSize.value}px`;
    });

    // Clear canvas
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            setButtonLoading(clearBtn, true);
            setTimeout(() => {
                setCanvasBackground();
                setButtonLoading(clearBtn, false);
            }, 300);
        }
    });

    // Save
    saveBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(saveBtn, true);
            const timestamp = new Date().toLocaleTimeString();
            const previewDiv = document.createElement('div');
            previewDiv.className = 'drawing-preview';
            previewDiv.innerHTML = `
                <img src="${canvas.toDataURL()}" alt="Drawing at ${timestamp}">
                <div class="preview-time">${timestamp}</div>
            `;
            drawingsContainer.insertBefore(previewDiv, drawingsContainer.firstChild);
            showNotification('Drawing saved to preview panel', 'success');
        } catch (error) {
            showNotification('Error saving drawing', 'error');
            console.error('Error:', error);
        } finally {
            setButtonLoading(saveBtn, false);
        }
    });

    // AI calculate
    aiBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(aiBtn, true);
            aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            const drawing = canvas.toDataURL();
            const response = await fetch(`${baseUrl}/ai-calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    // Notification system
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
