
## convert aab bundle to APK

# grab tool for conversion
if [  ! -f bundletool-all-1.13.1.jar ]; then
  wget https://github.com/google/bundletool/releases/download/1.13.1/bundletool-all-1.13.1.jar
fi

# generate signature
if [  ! -f acode.keystore ]; then
# keytool -genkey -v -keystore acode.keystore -alias acode -keyalg RSA -keysize 2048 -validity 10000 -storepasswd acode123 -keypasswd acode123
keytool -genkey -alias acode \
    -keyalg RSA -keystore acode.keystore \
    -dname "CN=Mark Smith, OU=JavaSoft, O=Sun, L=Cupertino, S=California, C=US" \
    -validity 36500 \
    -keysize 4096 \
    -storepass password -keypass password
fi

# cleanup if needed
rm -rf *.apks  toc.pb

# convert to apk
for aab in *.aab; do
java -jar "bundletool-all-1.13.1.jar" build-apks --bundle=$aab --mode=universal --output="${aab%.*}.apks" --ks=acode.keystore --ks-pass=pass:password --ks-key-alias=acode --key-pass=pass:password 

# extract apk
unzip ${aab%.*}.apks
mv -v universal.apk ${aab%.*}.apk
done
