template = open('index.html').read()
style = open('style.css').read()
script = open('main.js').read()

template = template.replace('<link rel="stylesheet" href="style.css" type="text/css" />', f"<style>{style}</style>")
template = template.replace('<script src="main.js"></script>', f"<script>{script}</script>")

with open('index.min.html', 'w') as f:
    f.write(template)
