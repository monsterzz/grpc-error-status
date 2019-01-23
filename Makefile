generate-proto:
	mkdir -p src
	protoc --proto_path=./protos --js_out=import_style=commonjs,binary:src $(shell find ./protos -name '*.proto')
