set -e
rm -rf ./bin
webpack
cp ./index.html ./bin