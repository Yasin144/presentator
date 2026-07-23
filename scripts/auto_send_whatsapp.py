import sys
import os
import time
import json
import urllib.request
import urllib.parse
import subprocess

def main():
    if len(sys.argv) < 2:
        return
    mobile_url = sys.argv[1].strip()
    if not mobile_url or not mobile_url.startswith('http'):
        return

    message = f"📱 Presentator 4G/5G Mobile Link:\n{mobile_url}\n\n🏠 Home Wi-Fi Link:\nhttp://192.168.29.161:5173"

    # 1. Instant Push Notification to Phone via ntfy.sh (Zero login, 0ms latency)
    try:
        req = urllib.request.Request("https://ntfy.sh/pattan_7386726193", data=message.encode('utf-8'))
        urllib.request.urlopen(req, timeout=5)
        print("[Auto-Send] Instant push notification sent to ntfy.sh/pattan_7386726193")
    except Exception as e:
        print("[Auto-Send] Push error:", e)

    # 2. Native WhatsApp URI + Browser API + Auto Focus & Auto Send (Zero Click)
    try:
        encoded_text = urllib.parse.quote(message)
        wa_app_url = f"whatsapp://send?phone=917386726193&text={encoded_text}"
        wa_web_url = f"https://api.whatsapp.com/send?phone=917386726193&text={encoded_text}"

        if sys.platform == 'win32':
            # Launch both native WhatsApp protocol app & web link
            os.system(f'start "" "{wa_app_url}"')
            os.system(f'start "" "{wa_web_url}"')
            
            # VBScript focused SendKeys auto-enter loop (3 attempts)
            vbs_code = '''
Set w = CreateObject("WScript.Shell")

' Attempt 1: Focus WhatsApp Native App
WScript.Sleep 3500
w.AppActivate "WhatsApp"
WScript.Sleep 300
w.SendKeys "~"

' Attempt 2: Focus Chrome / Edge / Browser tab
WScript.Sleep 2500
w.AppActivate "WhatsApp"
w.AppActivate "Chrome"
w.AppActivate "Edge"
WScript.Sleep 300
w.SendKeys "~"

' Attempt 3: Final Enter key stroke
WScript.Sleep 2000
w.SendKeys "~"
'''
            temp_dir = os.path.join(os.path.dirname(__file__), '..', 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            vbs_file = os.path.join(temp_dir, '_send_wa_focused.vbs')
            with open(vbs_file, 'w') as f:
                f.write(vbs_code)
            subprocess.run(['cscript', '//nologo', vbs_file], capture_output=True)
            print("[Auto-Send] WhatsApp focused auto-send completed for 7386726193")
    except Exception as e:
        print("[Auto-Send] WhatsApp error:", e)

if __name__ == '__main__':
    main()
