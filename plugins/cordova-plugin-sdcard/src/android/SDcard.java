package com.foxdebug.sdcard;

import java.io.File;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import java.net.URLConnection;

import android.net.Uri;
import android.app.Activity;
import android.content.Intent;
import android.content.Context;
import android.os.Build;
import android.os.storage.StorageManager;
import android.os.storage.StorageVolume;
import android.os.Bundle;
import android.content.ContentResolver;
import android.support.v4.provider.DocumentFile;
import android.text.TextUtils;
import android.provider.DocumentsContract;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class SDcard extends CordovaPlugin {

  private CallbackContext cb;
  private int mode;
  private int REQUEST_CODE;
  private int DOCUMENT_TREE;
  private int ACCESS_INTENT;
  private int OPEN_DOCUMENT;
  private StorageManager storageManager;
  private Context context;
  private Activity activity;
  private ContentResolver contentResolver;
  private DocumentFile originalRootFile;
  private String rootPath;

  public SDcard() {
    
  }

  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.ACCESS_INTENT = 6000;
    this.DOCUMENT_TREE = 6001;
    this.OPEN_DOCUMENT = 6002;
    this.REQUEST_CODE = this.ACCESS_INTENT;
    this.context = cordova.getContext();
    this.activity = cordova.getActivity();
    this.storageManager = (StorageManager) this.activity.getSystemService(Context.STORAGE_SERVICE);
  }

  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

    this.cb = callbackContext;

    if ("open".equals(action)) {

      if(args.length() == 0){
        this.cb.error("SDCardName required");
        return false;
      }

      Intent intent = null;

      // VERSION.SDK_INT >= 0x00000018 && VERSION.SDK_INT < 0x0000001d

      if (
        android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N &&
        android.os.Build.VERSION.SDK_INT <= 0x0000001c
        ) {
        String SDcardUUID = args.getString(0);
        StorageVolume sdCard = null;

        for(StorageVolume volume: this.storageManager.getStorageVolumes()){
          String uuid = volume.getUuid();
          if(uuid != null && uuid.equals(SDcardUUID)){
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

    }else if ("open document".equals(action)){
      Intent intent = new Intent();
      String mimeType = "*/*";
      intent.setAction(Intent.ACTION_OPEN_DOCUMENT);
      intent.addCategory(Intent.CATEGORY_OPENABLE);
      if(args.length() > 0) mimeType = args.getString(0);
      intent.setType(mimeType);
      cordova.startActivityForResult(this, intent, this.OPEN_DOCUMENT);
      return true;

    }else if("list".equals(action)){
      
      JSONObject volumes = new JSONObject();

      for(StorageVolume volume: this.storageManager.getStorageVolumes()){
        String name = volume.getDescription(this.context);
        String uuid = volume.getUuid();
        if(name != null && uuid != null){
          volumes.put(uuid, name);
        }
      }

      this.cb.success(volumes);

    }else{

      if(args.length() < 2){
        this.error("Few paramerter are missing");
        return false;
      }

      this.rootPath = args.getString(0);
      String arg1 = args.getString(1);
      String arg2 = null;

      if(args.length() == 3){
        arg2 = args.getString(2);
      }

      switch(action){
        case "write":
          if(arg2 == null){
            this.writeFile(arg1);
            return false;
          }
          this.writeFile(arg1, arg2);
          break;

        case "mkdir":
          this.mkdir(arg1, arg2);
          break;
        
        case "rename":
          if(arg2 == null){
            this.error("Missing argument 'newname'");
            return false;
          }
          this.rename(arg1, arg2);
          break;

        case "delete":
          this.delete(arg1);
          break;

        case "touch":
          this.touch(arg1, arg2);
          break;

        case "copy":
        case "move":
          if(arg2 == null){
            this.error("Missing argument 'destinationPath'");
            return false;
          }
          if(action.equals("move")) this.move(arg1, arg2);
          else this.copy(arg1, arg2);
          break;

        case "getpath":
          this.getPath(arg1);
        break;

        default:
        break;
      }
    }

    return true;

  }
  
  public void onActivityResult(int requestCode, int resultCode, Intent data){

    super.onActivityResult(requestCode, resultCode, data);

    if(requestCode == this.OPEN_DOCUMENT){

      if(resultCode == Activity.RESULT_OK){

        try{

          Uri uri = data.getData();
          this.takePermission(uri);
          DocumentFile file = DocumentFile.fromSingleUri(this.context, uri);
          JSONObject res = new JSONObject();

          res.put("length", file.length());
          res.put("type", file.getType());
          res.put("filename", file.getName());
          res.put("canWrite", file.canWrite());
          res.put("uri", uri.toString());
          this.cb.success(res);

        }catch(JSONException e){

          this.error(e.toString());

        }

      }

    }else{

      if(requestCode == this.ACCESS_INTENT && resultCode == Activity.RESULT_CANCELED){
        this.error("Canceled");
        return;
      }

      Uri uri = data.getData();
      if(uri  == null){
        this.error("Empty uri");
      }else{

        this.takePermission(uri);
        DocumentFile file = DocumentFile.fromTreeUri(this.context, uri);
        if(file!=null && file.canWrite()){
          this.cb.success(uri.toString());
        }else{
          this.error("No write permisson: "+uri.toString());
        }

      }

    }
    
  }

  private void writeFile(String filename, String content){
    try{
      DocumentFile file = this.getDocumentFile(filename);
      
      if(file == null){
        this.error("Not found(240): "+filename);
        return;
      }

      if(file.canWrite()){
      
        OutputStream op = this.context.getContentResolver().openOutputStream(file.getUri());
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(op));
        bw.write(content);
        bw.flush();
        bw.close();
        this.cb.success("SUCCESS");
      
      }else{
        this.error("No write permission - "+filename);
      }
    }catch(IOException e){
      this.error(""+e.toString()+": "+filename);
    }
  }

  private void writeFile(String content){
    try{
      DocumentFile file = DocumentFile.fromSingleUri(this.context, Uri.parse(this.rootPath));
      
      if(file == null){
        this.error("Not found(240): "+this.rootPath);
        return;
      }

      if(file.canWrite()){
      
        OutputStream op = this.context.getContentResolver().openOutputStream(file.getUri());
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(op));
        bw.write(content);
        bw.flush();
        bw.close();
        this.cb.success("SUCCESS");
      
      }else{
        this.error("No write permission - "+this.rootPath);
      }
    }catch(IOException e){
      this.error(""+e.toString()+": "+this.rootPath);
    }
  }

  private void mkdir(String parent, String dirname){
    DocumentFile alreadyExists = this.getDocumentFile(parent).findFile(dirname);

    if(alreadyExists != null){
      this.error("Directory already exists: "+dirname);
      return;
    }

    DocumentFile newDir = this.getDocumentFile(parent).createDirectory(dirname);
    if(newDir == null){
      this.error("Unable to create directory: "+dirname);
      return;
    }

    this.cb.success("SUCCESS");

  }

  private void rename(String filename, String newFile){
    DocumentFile file = this.getDocumentFile(filename);
    if(file == null){
      this.error("Not found(276): "+filename);
      return;
    }
    if(file.renameTo(newFile)){
      this.cb.success("SUCCESS");
      return;
    }

    if(file.isFile()){
      this.error("Unable to rename file: "+filename);
    }else{
      this.error("Unable to rename folder: "+filename);
    }
  }

  private void delete(String filename){
    DocumentFile file = this.getDocumentFile(filename);
    if(file == null){
      this.error("Not found(290): "+filename);
      return;
    }
    if(file.delete()){
      this.cb.success("SUCCESS");
      return;
    }

    this.error("Unable to delete file: "+filename);
  }

  private void touch(String parent, String filename){
    String mimeType = null;
    String fileNameWithoutExtention = filename.replaceFirst("[.][^.]+$", "");
    DocumentFile alreadyExists = this.getDocumentFile(parent).findFile(filename);

    mimeType = URLConnection.guessContentTypeFromName(filename);
    if(mimeType == null) mimeType = "text/plain";

    if(alreadyExists != null){
      this.error("File already exists: "+filename);
      return;
    }

    DocumentFile file = this.getDocumentFile(parent).createFile(mimeType, fileNameWithoutExtention);
    if(file == null){
      this.error("Unable to create file: "+filename);
      return;
    }
    if(!file.getName().equals(filename)) file.renameTo(filename);
    this.cb.success("SUCCESS");
  }

  private void move(String src, String dest){
    DocumentFile srcfile = this.getDocumentFile(src);
    if(srcfile == null){
      this.error("Not found(318): "+src);
      return;
    }
    DocumentFile parentfile = this.getParentDocumentFile(src);
    DocumentFile destfile = this.getDocumentFile(dest);

    if(destfile == null){
      this.error("Not found(359): "+destfile);
      return;
    }

    ContentResolver content = this.context.getContentResolver();

    try{

      Uri res = DocumentsContract.moveDocument(content, srcfile.getUri(), parentfile.getUri(), destfile.getUri());

      if(res == null){
        this.error("Unable to move: "+src);
        return;
      }

      this.cb.success("SUCCESS");

    }catch(FileNotFoundException e){
      this.error(e.toString());
    }
  }

  private void copy(String src, String dest){
    DocumentFile srcfile = this.getDocumentFile(src);
    if(srcfile == null){
      this.error("Not found(350): "+src);
      return;
    }
    DocumentFile destfile = this.getDocumentFile(dest);
    if(destfile == null){
      this.error("Not found(359): "+destfile);
      return;
    }

    this.copy(srcfile, destfile);

  }

  private void copy(DocumentFile src, DocumentFile dest){
    if(src.isFile()){
      boolean res = this.copyFile(src, dest);
      if(!res) this.error("Unable to copy: "+src.getName());
      return;
    }

    dest = dest.createDirectory(src.getName());
    DocumentFile[] files = src.listFiles();

    for(DocumentFile file:files){
      this.copy(file, dest);
    }

    this.cb.success("SUCCESS");

  }

  private boolean copyFile(DocumentFile src, DocumentFile dest){

    InputStream is = null;
    OutputStream os = null;

    try{

      DocumentFile newFile = dest.createFile(src.getType(), src.getName());
      is = this.context.getContentResolver().openInputStream(src.getUri());
      os = this.context.getContentResolver().openOutputStream(newFile.getUri());

      if(is == null || os == null) return false;

      byte[] bytes = new byte[1024];
      int len;

      while((len = is.read(bytes)) != -1){
        os.write(len);
        os.flush();
      }

      if(src.length() == newFile.length()) return true;

    }catch(FileNotFoundException e){

      this.error(e.toString());

    }catch(IOException e){

      this.error(e.toString());

    }finally{

      try {
        if (is != null) {
          is.close();
        }
        if (os != null) {
          os.close();
        }
      } catch (Exception e) {
        this.error(e.toString());
      }

    }

    return false;

  }

  private void getPath(String src){
    DocumentFile file = this.getDocumentFile(src);

    if(file == null){

      this.error("Unable to get file");
      
    }else{

      Uri uri = file.getUri();
      String path = uri.getPath();

      if(path != null){
        this.cb.success(uri.toString());
      }else{
        this.error("Unable to get path");
      }

    }
  }

  private void error(String err){
    this.cb.error("ERROR: "+err);
  }

  private DocumentFile getDocumentFile(String filename){

    return _DocumentFile(filename, 0);

  }

  private DocumentFile getParentDocumentFile(String filename){

    return _DocumentFile(filename, 1);

  }

  private DocumentFile _DocumentFile(String filename, int limit){

    List<String> paths = new ArrayList<String>();
    DocumentFile file = null;

    file = DocumentFile.fromTreeUri(this.context, Uri.parse(this.rootPath));
    if(!file.canWrite()){
      this.error("No write permission");
      return null;
    }

    paths.addAll(Arrays.asList(filename.split("/")));
    
    while(paths.size() > limit){
      String path = paths.remove(0);
      filename = TextUtils.join("/", paths);

      if(!path.equals("")){

        file = file.findFile(path);

        if(file == null) return null;
      }
    }

    return file;

  }

  private void takePermission(Uri uri){
    this.contentResolver = this.context.getContentResolver();
    this.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
  }

}