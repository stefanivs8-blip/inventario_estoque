bash

python3 -c "
with open('/home/claude/logo_clean_b64.txt') as f:
    logo = f.read().strip()
print(f'Logo length: {len(logo)}')
# Write just the logo as a JS constant file
with open('/home/claude/portocel-inventario/js/logo.js', 'w') as f:
    f.write(f'const PORTOCEL_LOGO = \"data:image/png;base64,{logo}\";')
print('logo.js written')
"
Saída

Logo length: 67164
logo.js written

