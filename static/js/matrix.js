function createMatrix(rows, cols, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    for (let i = 0; i < rows * cols; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = '0';
        input.className = 'matrix-input';
        container.appendChild(input);
    }
}

function createMatrixA() {
    const rows = parseInt(document.getElementById('matrixARows').value);
    const cols = parseInt(document.getElementById('matrixACols').value);
    createMatrix(rows, cols, 'matrixA');
}

function createMatrixB() {
    const rows = parseInt(document.getElementById('matrixBRows').value);
    const cols = parseInt(document.getElementById('matrixBCols').value);
    createMatrix(rows, cols, 'matrixB');
}

function getMatrixValues(containerId, rows, cols) {
    const inputs = document.querySelectorAll(`#${containerId} input`);
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            matrix[i][j] = parseFloat(inputs[i * cols + j].value) || 0;
        }
    }
    return matrix;
}

function displayResult(result) {
    const container = document.getElementById('resultMatrix');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${result[0].length}, 1fr)`;
    
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[0].length; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = result[i][j].toFixed(2);
            input.className = 'matrix-input';
            input.readOnly = true;
            container.appendChild(input);
        }
    }
}

function performOperation(operation) {
    const aRows = parseInt(document.getElementById('matrixARows').value);
    const aCols = parseInt(document.getElementById('matrixACols').value);
    const bRows = parseInt(document.getElementById('matrixBRows').value);
    const bCols = parseInt(document.getElementById('matrixBCols').value);
    
    if (operation === 'Add' && (aRows !== bRows || aCols !== bCols)) {
        showNotification('Matrices must have the same dimensions for addition', 'error');
        return;
    }
    
    if (operation === 'Multiply' && aCols !== bRows) {
        showNotification('Number of columns in A must equal number of rows in B for multiplication', 'error');
        return;
    }
    
    const matrixA = getMatrixValues('matrixA', aRows, aCols);
    const matrixB = getMatrixValues('matrixB', bRows, bCols);
    
    fetch('/matrix-calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            matrix_a: matrixA,
            matrix_b: matrixB,
            operation: operation
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            displayResult(data.result);
            showNotification('Operation completed successfully', 'success');
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Error: ' + error, 'error');
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

// Initialize matrices on page load
document.addEventListener('DOMContentLoaded', function() {
    createMatrixA();
    createMatrixB();
});
