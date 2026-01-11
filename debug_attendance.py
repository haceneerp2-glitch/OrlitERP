import http.client
import json

conn = http.client.HTTPConnection("localhost", 8000)
payload = json.dumps({
    "employee_id": 1,
    "date": "2025-12-07",
    "status": "present"
})
headers = {
    'Content-Type': 'application/json'
}
conn.request("POST", "/hr/attendance/", payload, headers)
res = conn.getresponse()
data = res.read()
print(f"Status: {res.status}")
print(f"Response: {data.decode('utf-8')}")
