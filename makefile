all: index.html

lint:
	npx prettier@3.6.2 --check .
	
format:
	npx prettier@3.6.2 --write .

index.html: index.template.html
	python3 pack.py
	npx prettier@3.6.2 --write index.html

test: index.html
	pytest --browser firefox --browser chromium

dev-deps:
	pip3 install pytest-playwright==0.7.1 && playwright install

clean:
	rm -rf .pytest_cache __pycache__ index.html
