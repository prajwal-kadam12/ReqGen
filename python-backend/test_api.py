
import requests
import os

def test_api():
    url = "http://localhost:5001/api/process-audio"
    audio_path = "uploads/Random_recording_for_ReqGen_1.m4a"
    
    if not os.path.exists(audio_path):
        print(f"File not found: {audio_path}")
        return

    print(f"Uploading {audio_path} to {url}...")
    try:
        with open(audio_path, 'rb') as f:
            files = {'audio': f}
            response = requests.post(url, files=files, timeout=600) # 10 minutes timeout
            
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success!")
            print(response.json())
        else:
            print("Failed!")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
