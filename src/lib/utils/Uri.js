import path from "./path";

export default {
  /**
   * Parse content uri to rootUri and docID
   * 
   * eg. 
   *```js 
   * parse("content://.../AA98-181D%3A::.../index.html")
   * //{rootUri: "content://.../AA98-181D%3A", docId: "...index.html"}
   *```
   * 
   * @param {string} contentUri 
   * @returns {{rootUri: string, docId: string, isFileUri: boolean}}
   */
  parse(contentUri) {
    let rootUri, docId = "";


    const DOC_PROVIDER = /^content:\/\/com\.((?![:<>"\/\\\|\?\*]).)*\.documents\//;
    const TREE_URI = /^content:\/\/com\.((?![:<>"\/\\\|\?\*]).)*\.documents\/tree\//;
    const SINGLE_URI = /^content:\/\/com\.(((?![:<>"\/\\\|\?\*]).)*)\.documents\/document/;
    const PRIMARY = /^content:\/\/com\.android\.externalstorage\.documents\/document\/primary/;
    let FILE_ROOT;

    try {
      FILE_ROOT = cordova.file.externalRootDirectory;
    } catch (error) {
      FILE_ROOT = "file:///storage/emulated/0/";
    }

    if (DOC_PROVIDER.test(contentUri)) {

      //If matches, it means url can be converted to file:///
      if (PRIMARY.test(contentUri)) {

        rootUri = FILE_ROOT + decodeURIComponent(contentUri).split(':').slice(-1)[0];

      } else if (TREE_URI.test(contentUri)) {

        if (/::/.test(contentUri)) {
          [rootUri, docId] = contentUri.split("::");
        } else {
          rootUri = contentUri;
          docId = decodeURIComponent(contentUri.split("/").slice(-1)[0]);
        }


      } else if (SINGLE_URI.test(contentUri)) {

        const [provider, providerId] = SINGLE_URI.exec(contentUri);
        docId = decodeURIComponent(contentUri); //DecodUri
        docId = docId.replace(provider, ''); //replace single to tree
        docId = path.normalize(docId); //normalize docid

        if (docId.startsWith('/'))
          docId = docId.slice(1); // remove leading '/'

        rootUri = `content://com.${providerId}.documents/tree/` + docId.split(':')[0] + "%3A";

      }

      return {
        rootUri,
        docId,
        isFileUri: /^file:\/\/\//.test(rootUri)
      };

    } else {

      throw new Error("Invalid uri format.");

    }
  },
  /**
   * Formats the five contentUri object to string
   * @param {{rootUri: string, docId: string} | String} contentUriObject or rootId
   * @param {string} [docId]
   * @returns {string}
   */
  format(contentUriObject, docId) {
    let rootUri;

    if (typeof contentUriObject === "string") {

      rootUri = contentUriObject;

    } else {

      rootUri = contentUriObject.rootUri;
      docId = contentUriObject.docId;

    }

    if (docId) return [rootUri, docId].join("::");
    else return rootUri;

  }
};