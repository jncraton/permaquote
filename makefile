all: index.html favicon.ico

lint:
	npx prettier@3.6.2 --check .
	
format:
	npx prettier@3.6.2 --write .

index.html: index.template.html
	python3 pack.py
	npx prettier@3.6.2 --write index.html

test: index.html
	pytest --browser firefox --browser chromium

favicon.ico:
	convert -size 48x48 xc:"#1E90FF" -font "Noto Sans" -pointsize 96 -fill white -gravity north -annotate 0 "“" favicon-48.png

	convert -background transparent favicon-48.png -define icon:auto-resize=16,32,48 "favicon.ico"

dev-deps:
	pip3 install pytest-playwright==0.7.1 && playwright install

clean:
	rm -rf .pytest_cache __pycache__ index.html favicon*
