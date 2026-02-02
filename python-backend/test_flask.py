"""
Simple Flask test to verify server can start
"""
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/test', methods=['GET'])
def test():
    return {'status': 'ok', 'message': 'Flask is working!'}

if __name__ == '__main__':
    print("Starting simple Flask test server...")
    app.run(host='0.0.0.0', port=5000, debug=False)
