#!/bin/bash

install() {
    curl '...'
    unzip -q veracode.zip && rm veracode.zip && mv veracode-* veracode
}

run() {
    ./veracode/run ./tmp/repo
}

cleanup() {
    rm -rf ./veracode
}

[[ $1 = "install" ]] && install()
[[ $1 = "cleanup" ]] && cleanup()
[[ $1 = "run" ]]     && run()