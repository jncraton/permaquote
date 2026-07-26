import re

template = open('index.template.html').read()
style = open('style.css').read()
template = template.replace('<link rel="stylesheet" href="style.css" type="text/css" />', f"<style>{style}</style>")
for jsfile in ['urinfo.js', 'camel.js', 'main.js']:
    script = open(jsfile).read()

    template = template.replace(f'<script src="{jsfile}"></script>', f"<script>{script}</script>")

with open('index.html', 'w') as f:
    f.write(template)
