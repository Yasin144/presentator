import sys
import os
import time
import json
import urllib.request
import urllib.parse
import subprocess
import pyautogui

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

    # 2. Native WhatsApp URI + PyAutoGUI Auto-Send (Zero Click)
    try:
        encoded_text = urllib.parse.quote(message)
        wa_app_url = f"whatsapp://send?phone=917386726193&text={encoded_text}"
        wa_web_url = f"https://api.whatsapp.com/send?phone=917386726193&text={encoded_text}"

        if sys.platform == 'win32':
            os.system(f'start "" "{wa_app_url}"')
            time.sleep(3.5)

            # PyAutoGUI auto-send sequence (Enter -> Ctrl+Enter -> Tab+Enter)
            pyautogui.press('enter')
            pyautogui.hotkey('ctrl', 'enter')
            time.sleep(0.5)
            pyautogui.press('enter')
            time.sleep(0.5)
            pyautogui.press('tab')
            pyautogui.press('enter')

            print("[Auto-Send] WhatsApp pyautogui auto-send completed for 7386726193")
    except Exception as e:
        print("[Auto-Send] WhatsApp error:", e)

if __name__ == '__main__':
    main()
