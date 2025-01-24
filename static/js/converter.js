let currentType = 'Length';
const unitMappings = {
    'Length': { input: 'meters', output: 'feet' },
    'Weight': { input: 'kilograms', output: 'pounds' },
    'Temperature': { input: '°C', output: '°F' }
};

document.addEventListener('DOMContentLoaded', function() {
    // Set up tab switching
    document.querySelectorAll('.converter-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab));
    });

    // Set up conversion on input change
    document.getElementById('inputValue').addEventListener('input', performConversion);
    document.getElementById('convertBtn').addEventListener('click', performConversion);
});

function switchTab(tab) {
    // Update active tab
    document.querySelectorAll('.converter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update current type and unit labels
    currentType = tab.dataset.type;
    document.getElementById('inputUnit').textContent = unitMappings[currentType].input;
    document.getElementById('outputUnit').textContent = unitMappings[currentType].output;

    // Clear inputs
    document.getElementById('inputValue').value = '';
    document.getElementById('outputValue').value = '';
}

function performConversion() {
    const input = document.getElementById('inputValue').value;
    if (!input) {
        document.getElementById('outputValue').value = '';
        return;
    }

    fetch('/convert-unit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            value: input,
            type: currentType
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('outputValue').value = data.result;
            addToHistory(input, data.result);
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Error: ' + error, 'error');
    });
}

function addToHistory(input, result) {
    const historyList = document.getElementById('historyList');
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <span>${input} ${unitMappings[currentType].input}</span>
        <i class="fas fa-arrow-right"></i>
        <span>${result}</span>
    `;
    historyList.insertBefore(historyItem, historyList.firstChild);

    // Keep only last 5 conversions
    if (historyList.children.length > 5) {
        historyList.removeChild(historyList.lastChild);
    }
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
