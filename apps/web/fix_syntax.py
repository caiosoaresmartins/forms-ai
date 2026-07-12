import re
with open('C:\\Users\\Notebook\\forms-ai\\apps\\web\\src\\app\\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\\`', '`').replace('\\${', '${')

with open('C:\\Users\\Notebook\\forms-ai\\apps\\web\\src\\app\\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
