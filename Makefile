.PHONY: install
install:
	npm install

.PHONY: lint
lint:
	npm run lint

.PHONY: lint-fix
lint-fix:
	npm run lint:fix

.PHONY: test
test:
	npm run test
