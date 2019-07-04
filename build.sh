set -e
rm -rf ./bin
webpack
cp ./index.html ./bin
touch ./bin/.nojekyll