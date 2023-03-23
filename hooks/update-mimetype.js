const fs = require('fs');
const path = require('path');

const strToReplace = `private String getMimeType(Uri uri) {
        String fileExtensionFromUrl = MimeTypeMap.getFileExtensionFromUrl(uri.toString()).toLowerCase();
        return  MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileExtensionFromUrl);
    }`;

const replaceWith = `private String getMimeType(Uri uri) {
        String fileExtensionFromUrl = MimeTypeMap.getFileExtensionFromUrl(uri.toString()).toLowerCase();
        if(fileExtensionFromUrl.equals("wasm")){
          return "application/wasm";
        }
        return  MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileExtensionFromUrl);
    }`;

const file = path.resolve(
  __dirname,
  "../platforms/android/app/src/main/java/org/apache/cordova/file/FileUtils.java",
);

const content = fs.readFileSync(file, "utf-8");
const newContent = content.replace(strToReplace, replaceWith);
fs.writeFileSync(file, newContent, 'utf-8');
