#!/bin/bash

install() {

    # grab the scripts options
    aws s3api get-object --bucket e2-scanners --key config/scripts ./tmp/config

    # download each of the scanner scripts
    while read script; do
        aws s3api get-object --bucket e2-scanners --key scanners/$script.zip ./tmp/scanners/$script.zip
        unzip ./tmp/scanners/$script.zip ./tmp/scanners/$script
    done <./tmp/config
    rm -rf ./tmp/scanners/*.zip

    # setup the scanners
    for scanner in ./tmp/scanners/*; do ./tmp/scanners/$scanner/run.sh setup; done

    # download the repo
    aws s3api get-object --bucket e2-scanners --key repo/$repo/$repo.zip ./tmp/$repo
    unzip ./tmp/$repo.zip ./tmp/$repo
    rm ./tmp/$repo.zip
}

run() {
    for scanner in ./tmp/scanners/*; do ./tmp/scanners/$scanner/run.sh run; done
}

cleanup() {
    rm -rf ./tmp/repo/* ./tmp/config
    for scanner in ./tmp/scanners/*; do ./tmp/scanners/$scanner/run.sh cleanup; done
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