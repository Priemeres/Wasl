"""Cross-platform HTTP measurement example. Set WASL_URL and DEVICE_TOKEN first."""
import json
import os
import urllib.request
url = os.environ.get('WASL_URL', 'http://127.0.0.1:8080').rstrip('/') + '/api/telemetry'
request = urllib.request.Request(url, data=json.dumps({'value': 26.4, 'unit': 'C'}).encode(), headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + os.environ['DEVICE_TOKEN']}, method='POST')
with urllib.request.urlopen(request, timeout=10) as response:
    print(response.read().decode())
