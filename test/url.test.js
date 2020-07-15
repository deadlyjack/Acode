import Url from '../src/lib/utils/Url';

test("Url -> basename", () => {
  let basename, url;

  url = "content://com.google.android.apps.docs.storage/document/acc%3D1%3Bdoc%3Dencoded%3DbSqLqOpTy%2BnoaoMrsVBZyB3AlfGth828I9DFDUxHsBzP3IHCj0u8UVVY";
  basename = Url.basename(url);
  expect(basename).toBeNull();

  url = "ftp://user:pass@ftp.foxdebug.com/?mode=passive";
  basename = Url.basename(url);
  expect(basename).toBe("");

  url = "ftp://user:pass@ftp.foxdebug.com?mode=passive";
  basename = Url.basename(url);
  expect(basename).toBe("");

  url = "ftp://user:pass@ftp.foxdebug.com/src/index.html?mode=passive";
  basename = Url.basename(url);
  expect(basename).toBe("index.html");

  url = "content://com.android.externalstorage.documents/document/primary%3AAcode%2Freact-app%2Findex.html";
  basename = Url.basename(url);
  expect(basename).toBe("index.html");

  url = "content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/index.js";
  basename = Url.basename(url);
  expect(basename).toBe("index.js");
});

test("Url -> extname", () => {
  let extname, url;

  url = "content://com.google.android.apps.docs.storage/document/acc%3D1%3Bdoc%3Dencoded%3DbSqLqOpTy%2BnoaoMrsVBZyB3AlfGth828I9DFDUxHsBzP3IHCj0u8UVVY";
  extname = Url.extname(url);
  expect(extname).toBeNull();

  url = "ftp://user:pass@ftp.foxdebug.com/src/index.html?mode=passive";
  extname = Url.extname(url);
  expect(extname).toBe(".html");

  url = "content://com.android.externalstorage.documents/document/primary%3AAcode%2Freact-app%2Findex.html";
  extname = Url.extname(url);
  expect(extname).toBe(".html");

  url = "content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/index.js";
  extname = Url.extname(url);
  expect(extname).toBe(".js");
});

test("Url -> join", () => {
  let join, url;

  url = "content://com.google.android.apps.docs.storage/document/acc%3D1%3Bdoc%3Dencoded%3DbSqLqOpTy%2BnoaoMrsVBZyB3AlfGth828I9DFDUxHsBzP3IHCj0u8UVVY";
  join = Url.join(url, "../src/main.js");
  expect(join).toBeNull();

  url = "ftp://user:pass@ftp.foxdebug.com/src/index.html?mode=passive";
  join = Url.join(url, "../main.js");
  expect(join).toBe("ftp://user:pass@ftp.foxdebug.com/src/main.js?mode=passive");

  url = "content://com.android.externalstorage.documents/document/primary%3AAcode%2Freact-app%2Findex.html";
  join = Url.join(url, "../main.js");
  expect(join).toBe("file:///storage/emulated/0/Acode/react-app/main.js");

  url = "content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/index.js";
  join = Url.join(url, "../main.js");
  expect(join).toBe("content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/main.js");

  url = "content://com.android.externalstorage.documents/document/AA98-181D%3AAcode%20editor%2Freact-app%2Fsrc%2Findex.js";
  join = Url.join(url, "../main.js");
  expect(join).toBe("content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/main.js");
});

test("Url -> pathname", () => {
  let pathname, url;

  url = "content://com.google.android.apps.docs.storage/document/acc%3D1%3Bdoc%3Dencoded%3DbSqLqOpTy%2BnoaoMrsVBZyB3AlfGth828I9DFDUxHsBzP3IHCj0u8UVVY";
  pathname = Url.pathname(url);
  expect(pathname).toBeNull();

  url = "ftp://user:pass@ftp.foxdebug.com/src/index.html?mode=passive";
  pathname = Url.pathname(url);
  expect(pathname).toBe("/src/index.html");

  url = "content://com.android.externalstorage.documents/document/primary%3AAcode%2Freact-app%2Findex.html";
  pathname = Url.pathname(url);
  expect(pathname).toBe("/storage/emulated/0/Acode/react-app/index.html");

  url = "content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/index.js";
  pathname = Url.pathname(url);
  expect(pathname).toBe("/Acode editor/react-app/src/index.js");

  url = "content://com.android.externalstorage.documents/document/AA98-181D%3AAcode%20editor%2Freact-app%2Fsrc%2Findex.js";
  pathname = Url.pathname(url);
  expect(pathname).toBe("/Acode editor/react-app/src/index.js");
});

test("Url -> dirname", () => {
  let dirname, url;

  url = "content://com.google.android.apps.docs.storage/document/acc%3D1%3Bdoc%3Dencoded%3DbSqLqOpTy%2BnoaoMrsVBZyB3AlfGth828I9DFDUxHsBzP3IHCj0u8UVVY";
  dirname = Url.dirname(url);
  expect(dirname).toBeNull();

  url = "ftp://user:pass@ftp.foxdebug.com/src/index.html?mode=passive";
  dirname = Url.dirname(url);
  expect(dirname).toBe("ftp://user:pass@ftp.foxdebug.com/src/?mode=passive");

  url = "content://com.android.externalstorage.documents/document/primary%3AAcode%2Freact-app%2Findex.html";
  dirname = Url.dirname(url);
  expect(dirname).toBe("file:///storage/emulated/0/Acode/react-app/");

  debugger;
  url = "content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/index.js";
  dirname = Url.dirname(url);
  expect(dirname).toBe("content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/");

  url = "content://com.android.externalstorage.documents/document/AA98-181D%3AAcode%20editor%2Freact-app%2Fsrc%2Findex.js";
  dirname = Url.dirname(url);
  expect(dirname).toBe("content://com.android.externalstorage.documents/tree/AA98-181D%3A::AA98-181D:Acode editor/react-app/src/");
});