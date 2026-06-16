import sys, re
token = b'HF_TOKEN_LOCAL'
data = sys.stdin.buffer.read()
sys.stdout.buffer.write(data.replace(token, b'HF_TOKEN_PLACEHOLDER'))
