#!/bin/bash

install() {
    curl 'https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.4.0.54424.zip' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br' -H 'Referer: https://www.sonarqube.org/' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: cross-site'
    unzip -q sonarqube.zip && rm sonarqube.zip && mv sonarqube-* sonarqube
}

run() {
    ./sonarqube/run ./tmp/repo
}

cleanup() {
    rm -rf ./sonarqube
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