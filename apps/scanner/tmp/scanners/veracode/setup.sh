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

if [[ $# != 1 ]]; then
    echo "usage: ..."
elif [[ $1 = "install" ]]; then
    install()
elif [[ $1 = "run" ]]; then
    run($2)
elif [[ $1 = "cleanup" ]]; then
    cleanup()
fi