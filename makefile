all: lint

lint:
	npx prettier@3.6.2 --check .
	
format:
	npx prettier@3.6.2 --write .

test:
	pytest --browser firefox --browser chromium --browser webkit
dev-deps:
	pip3 install pytest-playwright==0.7.1 && playwright install

clean:
	rm -rf .pytest_cache
