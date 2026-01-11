import urllib.request, urllib.parse, json

url = 'http://localhost:8000/api/v1/auth/login'
data = urllib.parse.urlencode({'username':'admin','password':'admin123'}).encode()
req = urllib.request.Request(url, data=data, method='POST')
req.add_header('Content-Type','application/x-www-form-urlencoded')
with urllib.request.urlopen(req) as resp:
    body = resp.read().decode()
    token = json.loads(body)['access_token']
    print('Token:', token)

# get user info
url_me = 'http://localhost:8000/api/v1/auth/me'
req2 = urllib.request.Request(url_me, method='GET')
req2.add_header('Authorization', f'Bearer {token}')
with urllib.request.urlopen(req2) as resp2:
    print('User info:', resp2.read().decode())
