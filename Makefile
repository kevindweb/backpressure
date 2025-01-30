.PHONY: install
install:
	npm install

.PHONY: lint
lint:
	npm run lint

.PHONY: lint-fix
lint-fix:
	npm run lint:fix

.PHONY: build
build:
	npm run build
