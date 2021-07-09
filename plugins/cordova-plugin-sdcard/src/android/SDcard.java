package com.foxdebug;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.OutputStream;
import java.io.FileNotFoundException;

import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;

import android.util.Log;

import java.net.URLConnection;

import android.net.Uri;

import android.app.Activity;

import android.content.Intent;
import android.content.Context;
import android.content.ContentResolver;

import android.os.Build;
import android.os.storage.StorageManager;
import android.os.storage.StorageVolume;

import android.text.TextUtils;

import android.provider.MediaStore;
import android.provider.DocumentsContract;
import android.provider.DocumentsContract.Document;

import android.database.Cursor;

import androidx.documentfile.provider.DocumentFile;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.codec.binary.Base64;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class SDcard extends CordovaPlugin {

  private CallbackContext callback;
  private int mode;
  private int REQUEST_CODE;
  private final int ACCESS_INTENT = 6000;
  private final int DOCUMENT_TREE = 6001;
  private final int OPEN_DOCUMENT = 6002;
  private final int PICK_FROM_GALLARY = 6003;
  private final String SAPERATOR = "::";
  private StorageManager storageManager;
  private Context context;
  private Activity activity;
  private ContentResolver contentResolver;
  private DocumentFile originalRootFile;

  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.REQUEST_CODE = this.ACCESS_INTENT;
    this.context = cordova.getContext();
    this.activity = cordova.getActivity();
    this.storageManager = (StorageManager) this.activity.getSystemService(Context.STORAGE_SERVICE);
  }

  public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext)
      throws JSONException {

    this.callback = callbackContext;

    String arg1 = null, arg2 = null, arg3 = null, arg4 = null;
    int argLen = args.length();

    if (argLen > 0)
      arg1 = args.getString(0);

    if (argLen > 1)
      arg2 = args.getString(1);

    if (argLen > 2)
      arg3 = args.getString(2);

    switch (action) {

      case "create directory":
        this.createDir(arg1, arg2);
        break;

      case "create file":
        this.createFile(arg1, arg2);
        break;

      case "open document file":
        this.openDocumentFile(arg1);
        break;

      case "get image":
        this.getImage(arg1);
        break;

      case "list volumes":
        this.getStorageVolumes();
        break;

      case "storage permission":
        this.getStorageAccess(arg1);
        break;

      case "write":
        this.writeFile(formatUri(arg1), arg2);
        break;

      case "rename":
        this.rename(arg1, arg2);
        break;

      case "delete":
        this.delete(formatUri(arg1));
        break;

      case "copy":
        this.copy(arg1, arg2);
        break;

      case "move":
        this.move(arg1, arg2);
        break;

      case "getpath":
        this.getPath(formatUri(arg1), arg2);
        break;

      case "exists":
        this.exists(formatUri(arg1));
        break;

      case "format uri":
        this.callback.success(formatUri(arg1));
        break;

      case "list directory":

        if (arg1.contains(SAPERATOR)) {

          String splittedStr[] = arg1.split(SAPERATOR, 2);
          arg1 = splittedStr[0];
          arg2 = splittedStr[1];

        }

        this.listDir(arg1, arg2);

        break;

      case "stats":
        this.getStats(arg1);
        break;

      default:
        return false;
    }

    return true;

  }

  private String formatUri(String filename) {
    if (filename.contains(SAPERATOR)) {

      String splittedStr[] = filename.split(SAPERATOR, 2);
      String rootUri = splittedStr[0];
      String docId = splittedStr[1];

      Uri uri = getUri(rootUri, docId);

      return uri.toString();

    } else {

      return filename;

    }
  }

  public void openDocumentFile(String mimeType) {
    Intent intent = new Intent();
    if (mimeType == null)
      mimeType = "*/*";
    intent.setAction(Intent.ACTION_OPEN_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType(mimeType);
    cordova.startActivityForResult(this, intent, this.OPEN_DOCUMENT);
  }

  public void getImage(String mimeType) {
    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
    if (mimeType == null)
      mimeType = "image/*";

    intent.setType(mimeType);
    cordova.startActivityForResult(this, intent, this.PICK_FROM_GALLARY);
  }

  public void getStorageVolumes() {
    try {
      JSONArray result = new JSONArray();
      for (StorageVolume volume : this.storageManager.getStorageVolumes()) {
        String name = volume.getDescription(this.context);
        String uuid = volume.getUuid();
        JSONObject volumeData = new JSONObject();
        if (name != null && uuid != null) {
          volumeData.put("uuid", uuid);
          volumeData.put("name", name);

          result.put(volumeData);
        }
      }

      this.callback.success(result);
    } catch (JSONException e) {
      this.error(e.toString());
    }
  }

  public void getStorageAccess(String SDCardUUID) {

    Intent intent = null;

    // VERSION.SDK_INT >= 0x00000018 && VERSION.SDK_INT < 0x0000001d

    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N
        && android.os.Build.VERSION.SDK_INT <= 0x0000001c) {

      StorageVolume sdCard = null;

      for (StorageVolume volume : this.storageManager.getStorageVolumes()) {
        String uuid = volume.getUuid();
        if (uuid != null && uuid.equals(SDCardUUID)) {
          sdCard = volume;
        }
      }

      if (sdCard != null) {
        intent = sdCard.createAccessIntent(null);
      }
    }

    if (intent == null) {
      this.REQUEST_CODE = this.DOCUMENT_TREE;
      intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
    }

    cordova.startActivityForResult(this, intent, this.REQUEST_CODE);
  }

  public void onActivityResult(int requestCode, int resultCode, Intent data) {

    super.onActivityResult(requestCode, resultCode, data);

    if (data == null)
      return;

    if (requestCode == this.PICK_FROM_GALLARY) {
      if (resultCode == Activity.RESULT_OK) {
        Uri uri = data.getData();
        this.callback.success(uri.toString());
      }
      return;
    }

    if (requestCode == this.OPEN_DOCUMENT) {

      if (resultCode == Activity.RESULT_OK) {

        try {

          Uri uri = data.getData();
          this.takePermission(uri);
          DocumentFile file = DocumentFile.fromSingleUri(this.context, uri);
          JSONObject res = new JSONObject();

          res.put("length", file.length());
          res.put("type", file.getType());
          res.put("filename", file.getName());
          res.put("canWrite", file.canWrite());
          res.put("uri", uri.toString());
          this.callback.success(res);

        } catch (JSONException e) {

          this.error(e.toString());

        }

      }

      return;
    }

    if (requestCode == this.DOCUMENT_TREE) {

      if (requestCode == this.ACCESS_INTENT && resultCode == Activity.RESULT_CANCELED) {
        this.error("Canceled");
        return;
      }

      try {
        Uri uri = data.getData();
        if (uri == null) {
          this.error("Empty uri");
        } else {

          this.takePermission(uri);
          DocumentFile file = DocumentFile.fromTreeUri(this.context, uri);
          if (file != null && file.canWrite()) {
            this.callback.success(uri.toString());
          } else {
            this.error("No write permisson: " + uri.toString());
          }

        }
      } catch (Exception e) {

        this.error(e.toString());

      }

      return;
    }

  }

  private void writeFile(final String filename, final String content) {
    final CallbackContext callback = this.callback;
    final Context context = this.context;

    cordova.getThreadPool().execute(new Runnable() {

      @Override
      public void run() {
        try {
          DocumentFile file = getFile(filename);

          if (file.canWrite()) {
            OutputStream op = context.getContentResolver().openOutputStream(file.getUri(), "rwt");

            if (Base64.isBase64(content)) {

              byte[] contentAsByte = Base64.decodeBase64(content);
              op.write(contentAsByte);

            } else {
              PrintWriter pw = new PrintWriter(op, true);

              pw.print(content);
              pw.flush();
              pw.close();
            }

            op.close();
            callback.success("OK");

          } else {
            callback.error("No write permission - " + filename);
          }
        } catch (IOException e) {
          callback.error(e.toString() + ": " + filename);
        }
      }
    });
  }

  private void createDir(String parent, String name) {
    create(parent, name, Document.MIME_TYPE_DIR);
  }

  private void createFile(String parent, String name) {
    String mimeType = URLConnection.guessContentTypeFromName(name);
    String ext = FilenameUtils.getExtension(name);
    if (mimeType == null && ext != null)
      mimeType = "text/" + ext;
    else
      mimeType = "text/plain";

    create(parent, name, mimeType);
  }

  private void create(String parent, String name, String mimeType) {

    try {

      String srcUri = null, docId = null;
      Uri parentUri = null;

      if (parent.contains(SAPERATOR)) {
        String splittedStr[] = parent.split(SAPERATOR, 2);
        srcUri = splittedStr[0];
        docId = splittedStr[1];
        parentUri = getUri(srcUri, docId);
      } else {
        srcUri = parent;
        parentUri = Uri.parse(srcUri);
        docId = DocumentsContract.getTreeDocumentId(parentUri);
        parentUri = DocumentsContract.buildDocumentUriUsingTree(parentUri, docId);
      }

      ContentResolver contentResolver = this.context.getContentResolver();
      Uri newDocumentUri = DocumentsContract.createDocument(contentResolver, parentUri, mimeType, name);
      DocumentFile file = getFile(newDocumentUri);
      if (!name.equals(file.getName()))
        newDocumentUri = DocumentsContract.renameDocument(contentResolver, newDocumentUri, name);

      docId = DocumentsContract.getDocumentId(newDocumentUri);
      if (newDocumentUri != null)
        this.callback.success(srcUri + SAPERATOR + docId);
      else
        this.error("Unable to create " + parent);

    } catch (Exception e) {
      Log.d("SDcard create " + mimeType, "Unable to create", e);
      this.error(e.toString());
    }

  }

  private void rename(String filename, String newFile) {
    try {

      String srcUri = null, docId = null;
      Uri fileUri = null;
      if (filename.contains(SAPERATOR)) {
        String splittedStr[] = filename.split(SAPERATOR, 2);
        srcUri = splittedStr[0];
        docId = splittedStr[1];
        fileUri = getUri(srcUri, docId);
      } else {
        srcUri = filename;
        fileUri = Uri.parse(filename);
      }

      ContentResolver contentResolver = this.context.getContentResolver();
      Uri renamedDocument = DocumentsContract.renameDocument(contentResolver, fileUri, newFile);
      docId = DocumentsContract.getDocumentId(renamedDocument);

      if (renamedDocument != null)
        this.callback.success(srcUri + SAPERATOR + docId);
      else
        this.error("Unable to rename " + filename);

    } catch (Exception e) {
      Log.d("SDcard rename", "Unable to rename", e);
      this.error(e.toString());
    }
  }

  private void delete(String filename) {
    ContentResolver contentResolver = context.getContentResolver();
    Uri fileUri = Uri.parse(filename);

    try {
      boolean fileDeleted = DocumentsContract.deleteDocument(contentResolver, fileUri);

      if (fileDeleted)
        this.callback.success(filename);
      else
        this.error("Unable to delete file " + filename);
    } catch (FileNotFoundException e) {
      this.error(e.toString());
    }
  }

  private void move(String src, String dest) {

    final ContentResolver contentResolver = this.context.getContentResolver();
    final String splittedStr[] = src.split(SAPERATOR, 2);
    final String rootUri = splittedStr[0];
    final String srcId = splittedStr[1];
    final String destId = dest.split(SAPERATOR, 2)[1];
    final CallbackContext callback = this.callback;

    cordova.getThreadPool().execute(new Runnable() {

      @Override
      public void run() {

        try {
          Uri newUri = copy(rootUri, srcId, destId);
          if (newUri == null)
            callback.error("Unable to copy " + src);
          else {
            DocumentsContract.deleteDocument(contentResolver, getUri(rootUri, srcId));
            callback.success(rootUri + SAPERATOR + DocumentsContract.getDocumentId(newUri));
          }
        } catch (Exception e) {
          callback.error(e.toString());
        }

      }
    });

  }

  private void copy(String src, String dest) {

    final String splittedStr[] = src.split(SAPERATOR, 2);
    final String srcUri = splittedStr[0];
    final String srcId = splittedStr[1];
    final String destId = dest.split(SAPERATOR, 2)[1];
    final CallbackContext callback = this.callback;

    cordova.getThreadPool().execute(new Runnable() {

      @Override
      public void run() {

        try {
          Uri newUri = copy(srcUri, srcId, destId);
          if (newUri == null)
            callback.error("Unable to copy " + src);
          else
            callback.success(srcUri + SAPERATOR + DocumentsContract.getDocumentId(newUri));
        } catch (Exception e) {
          callback.error(e.toString());
        }

      }
    });

  }

  private Uri copy(String root, String srcId, String destId) throws IOException, FileNotFoundException {

    Uri srcUri = getUri(root, srcId);
    Uri destUri = getUri(root, destId);
    DocumentFile src = getFile(srcUri);
    DocumentFile dest = getFile(destUri);
    ContentResolver contentResolver = context.getContentResolver();

    if (src.isFile()) {
      Uri newUri = copyFile(src, dest);
      if (newUri == null)
        return null;
      else
        return newUri;

    } else {

      destUri = DocumentsContract.createDocument(contentResolver, destUri, Document.MIME_TYPE_DIR, src.getName());
      destId = DocumentsContract.getDocumentId(destUri);

      Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(Uri.parse(root), srcId);
      Cursor c = contentResolver.query(childrenUri, new String[] { Document.COLUMN_DOCUMENT_ID }, null, null, null);
      if (c != null) {
        while (c.moveToNext()) {
          String docId = c.getString(0);
          copy(root, docId, destId);
        }
        c.close();
        return destUri;
      } else {
        DocumentsContract.deleteDocument(contentResolver, destUri);
        return null;
      }

    }

  }

  private Uri copyFile(DocumentFile src, DocumentFile dest) throws IOException, FileNotFoundException {

    ContentResolver contentResolver = this.context.getContentResolver();

    Uri newFileUri = DocumentsContract.createDocument(contentResolver, dest.getUri(), src.getType(), src.getName());
    DocumentFile newFile = getFile(newFileUri);
    InputStream is = contentResolver.openInputStream(src.getUri());
    OutputStream os = contentResolver.openOutputStream(newFile.getUri(), "rwt");

    if (is == null || os == null) {
      DocumentsContract.deleteDocument(contentResolver, newFileUri);
      return null;
    }

    IOUtils.copy(is, os);

    is.close();
    os.close();

    if (src.length() == newFile.length())
      return newFile.getUri();
    else {
      DocumentsContract.deleteDocument(contentResolver, newFileUri);
      return null;
    }

  }

  private void listDir(String src, String parentDocId) {
    Uri srcUri = Uri.parse(src);
    ContentResolver contentResolver = this.context.getContentResolver();

    if (parentDocId == null) {
      parentDocId = DocumentsContract.getTreeDocumentId(srcUri);
    }

    Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(srcUri, parentDocId);

    JSONArray result = new JSONArray();
    Cursor c = contentResolver.query(childrenUri,
        new String[] { Document.COLUMN_DOCUMENT_ID, Document.COLUMN_DISPLAY_NAME, Document.COLUMN_MIME_TYPE }, null,
        null, null);

    try {
      while (c.moveToNext()) {
        JSONObject fileData = new JSONObject();
        String docId = c.getString(0);
        String name = c.getString(1);
        String mime = c.getString(2);
        boolean isDirectory = isDirectory(mime);

        fileData.put("name", name);
        fileData.put("mime", mime);
        fileData.put("isDirectory", isDirectory);
        fileData.put("isFile", !isDirectory);
        fileData.put("uri", src + this.SAPERATOR + docId);
        result.put(fileData);
      }

      this.callback.success(result);
    } catch (JSONException e) {

      this.error(e.toString());

    } finally {
      if (c != null) {
        try {
          c.close();
        } catch (RuntimeException re) {
          throw re;
        } catch (Exception ignore) {
          // ignore exception
        }
      }
    }
  }

  private boolean isDirectory(String mimeType) {
    return DocumentsContract.Document.MIME_TYPE_DIR.equals(mimeType);
  }

  private void getStats(String filename) {
    String fileUri = formatUri(filename);

    try {
      DocumentFile file = getFile(fileUri);

      JSONObject result = new JSONObject();
      result.put("exists", file.exists());
      result.put("canRead", file.canRead());
      result.put("canWrite", file.canWrite());
      result.put("name", file.getName());
      result.put("length", file.length());
      result.put("type", file.getType());
      result.put("isFile", file.isFile());
      result.put("isDirectory", file.isDirectory());
      result.put("isVirtual", file.isVirtual());
      result.put("lastModified", file.lastModified());

      this.callback.success(result);
    } catch (Exception e) {
      this.error(e.getMessage());
    }
  }

  private Uri getUri(String src, String docId) {
    Uri srcUri = Uri.parse(src);
    String srcId = DocumentsContract.getTreeDocumentId(srcUri);
    srcUri = DocumentsContract.buildDocumentUriUsingTree(srcUri, srcId);
    return DocumentsContract.buildDocumentUriUsingTree(srcUri, docId);
  }

  private void exists(String path) {
    DocumentFile file = DocumentFile.fromSingleUri(this.context, Uri.parse(path));

    if (file == null) {
      this.error("Unable to get file");
    } else {

      if (file.exists()) {
        this.callback.success("TRUE");
      } else {
        this.callback.success("FALSE");
      }

    }

  }

  private void error(String err) {
    this.callback.error("ERROR: " + err);
  }

  private void getPath(String uriString, String src) {
    DocumentFile file = geRelativetDocumentFile(uriString, src);

    if (file == null) {

      this.error("Unable to get file");

    } else {

      Uri uri = file.getUri();
      String path = uri.getPath();

      if (path != null) {
        this.callback.success(uri.toString());
      } else {
        this.error("Unable to get path");
      }

    }
  }

  private DocumentFile geRelativetDocumentFile(String uri, String filename) {

    List<String> paths = new ArrayList<String>();
    DocumentFile file = null;

    file = DocumentFile.fromTreeUri(this.context, Uri.parse(uri));
    if (!file.canWrite()) {
      this.error("No write permission");
      return null;
    }

    paths.addAll(Arrays.asList(filename.split("/")));

    while (paths.size() > 0) {
      String path = paths.remove(0);
      filename = TextUtils.join("/", paths);

      if (!path.equals("")) {

        file = file.findFile(path);

        if (file == null)
          return null;
      }
    }

    return file;

  }

  private DocumentFile getFile(Uri uri) {
    return getFile(uri.toString());
  }

  private DocumentFile getFile(String filePath) {
    Uri fileUri = Uri.parse(filePath);
    DocumentFile documentFile = null;

    if (filePath.matches("file:///(.*)")) {
      File file = new File(fileUri.getPath());
      documentFile = DocumentFile.fromFile(file);
    } else {
      documentFile = DocumentFile.fromSingleUri(this.context, Uri.parse(filePath));
    }

    return documentFile;
  }

  private void takePermission(Uri uri) {
    this.contentResolver = this.context.getContentResolver();
    this.contentResolver.takePersistableUriPermission(uri,
        Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
  }

}
