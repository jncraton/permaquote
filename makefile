all: lint

lint:
	npx prettier@3.6.2 --check .
	
format:
	npx prettier@3.6.2 --write .

clean:
	rm -rf .pytest_cache
