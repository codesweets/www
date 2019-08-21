set -e
rm -rf ./bin
webpack
touch ./bin/.nojekyll