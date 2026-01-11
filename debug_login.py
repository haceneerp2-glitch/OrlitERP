import urllib.request
import urllib.parse
import json

def test_login():
    url = "http://localhost:8000/api/v1/auth/login"
    data = urllib.parse.urlencode({
        "username": "admin",
        "password": "admin123"
    }).encode()

    req = urllib.request.Request(url, data=data, method="POST")
    # Content-Type application/x-www-form-urlencoded is default when data is passed, but let's be explicit
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')

    try:
        print(f"Sending POST to {url}")
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.getcode()}")
            print(f"Response Body: {response.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Error Body: {e.read().decode()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
