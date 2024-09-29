from flask import Flask, render_template, request, jsonify
import numpy as np

app = Flask(__name__)

@app.route('/')
def calculator():
    return render_template('calculator.html')

@app.route('/graph')
def graph():
    return render_template('graph.html')

# Other routes for formulae, convert, periodic, etc.
@app.route('/formulae')
def formulae():
    return render_template('formulae.html')

@app.route('/convert')
def convert():
    return render_template('convert.html')

@app.route('/periodic')
def periodic():
    return render_template('periodic.html')

@app.route('/translate')
def translate():
    return render_template('translate.html')

@app.route('/matrix')
def matrix_calculator():
    return render_template('matrix.html')

@app.route('/matrix', methods=['POST'])
def process_matrices():
    data = request.get_json()
    matrix_a = np.array(parse_matrix(data['matrixA']))
    matrix_b = np.array(parse_matrix(data['matrixB'])) if 'matrixB' in data and data['matrixB'] else None
    operation = data['operation']
    
    try:
        if operation == 'add':
            result = np.add(matrix_a, matrix_b)
        elif operation == 'multiply':
            result = np.dot(matrix_a, matrix_b)
        elif operation == 'transposeA':
            result = np.transpose(matrix_a)
        else:
            return jsonify({"result": "Invalid operation"}), 400

        return jsonify({"result": format_matrix(result)})
    except Exception as e:
        return jsonify({"result": f"Error: {str(e)}"}), 400

def parse_matrix(matrix_str):
    return [list(map(float, row.split(','))) for row in matrix_str.splitlines() if row]

def format_matrix(matrix):
    return "\n".join([", ".join(map(str, row)) for row in matrix])

if __name__ == '__main__':
    app.run(debug=True)
