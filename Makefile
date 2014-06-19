NPM_BIN=$(CURDIR)/node_modules/.bin
export NPM_BIN

node_modules: package.json
	npm install
	touch node_modules

test: node_modules
	npm test

.PHONY: yate
