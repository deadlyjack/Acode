echo "Setting up the project..."

npm install
cordova platform add android@10
cordova prepare
mkdir -p www/css/build www/js/build