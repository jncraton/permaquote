import re

template = open('index.template.html').read()
template = re.sub("\n[ ]*", "", template)

style = open('style.css').read()
script = open('main.js').read()
script = re.sub("\n[\n ]*", "\n", script)

style = re.sub("\n[ ]*", "", style)

template = template.replace('<link rel="stylesheet" href="style.css" type="text/css" />', f"<style>{style}</style>")
template = template.replace('<script src="main.js"></script>', f"<script>{script}</script>")

with open('index.html', 'w') as f:
    f.write(template)
