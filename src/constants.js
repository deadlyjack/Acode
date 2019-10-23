const FILE_NAME_REGEX = /^((?![:<>"\/\\\|\?\*]).)*$/;
const FONT_SIZE = /^[0-9]{1,2}(px|em|pt|mm|pc|in)$/;
const string = {
  "en-us": {
    "lang": "English",
    "A1": "To select text, double tap where you want to start selecting and drag to position where you want to end selection, or enable shift key and use arrow keys in second footer row to select text.",
    "A2": "Emmet is a plugin which greatly improves HTML & CSS workflow. To know more go to https://emmet.io",
    "A3": "To cut, copy and paste text, first select the text and then tap and hold for editor context menu.",
    "A4": "To cut, copy and paste file, tap and hold on file or folder in side navigation menu for file and folder options.",
    "A5": "To run web application open the index HTML file and click run button in bottom right corner.",
    "A6": "To see errors and logs, click on blue floating button in preview window.",
    "about": "About",
    "about app": "Acode editor is a source code editor for android. Developed by Ajit Kumar (Dellevan Jack).",
    "active files": "active files",
    "alert": "Alert",
    "app theme": "App theme",
    "beautify on save": "Beautify on save",
    "cancel": "cancel",
    "change language": "Change language",
    "close app": "Close the application?",
    "clipboard defination": "Contains clipboard options like, cut, copy, paste and select all and also contain option to toggle command palette",
    "control file and folders": "Control files and folder",
    "copy": "Copy",
    "copydown defination": "Copy active line downward.",
    "copyup defination": "Copy active line upward.",
    "create folder error": "Sorry, unable create new folder",
    "cut": "Cut",
    "delete": "Delete",
    "delete {name}": "Delete {name}?",
    "dependencies": "Dependencies",
    "down defination": "Move cursor downward.",
    "editor settings": "Editor settings",
    "editor theme": "Editor theme",
    "enter file name": "Enter file name",
    "enter folder name": "Enter folder name",
    "empty folder message": "Empty Folder",
    "enter line number": "Enter line number",
    "error": "error",
    "failed": "failed",
    "file already exists": "File already exists. Overwrite?",
    "file changed": " has been changed, reload file?",
    "file deleted": "file deleted",
    "file is not supported": "file is not supported",
    "file not supported": "This file type is not supported.",
    "file too large": "File is to large to handle. Max file size allowed is",
    "file renamed": "filed renamed",
    "file saved": "file saved",
    "folder added": "folder added",
    "folder already added": "folder already added",
    "font size": "Font size",
    "goto": "Goto line",
    "help": "Help",
    "icons definition": "Icons definition",
    "info": "info",
    "language changed": "language has been changed successfully",
    "left defination": "Move cursor to left.",
    "linting": "Check syntax error?",
    "movedown defination": "Move active line downward.",
    "moveup defination": "Move active line upward.",
    "new file": "New file",
    "new folder": "New Folder",
    "no": "No",
    "no editor message": "Open or create new file and folder from menu",
    "number of unsaved file warning": "unsaved files, close app anyway?",
    "notice": "Notice",
    "open file": "Open file",
    "open files and folders": "Open files and folders",
    "open folder": "Open folder",
    "ok": "ok",
    "paste": "Paste",
    "Q1": "How to select text?",
    "Q2": "What is emmet?",
    "Q3": "How to cut, copy and paste text?",
    "Q4": "How to cut, copy and paste file?",
    "Q5": "How to run web application?",
    "Q6": "How to see error and logs?",
    "Q7": "Need help?",
    "Q8": "Feedback?",
    "qa section": "QnA section",
    "read only file": "Cannot save read only file. Please try save as",
    "redo defination": "redo",
    "reload": "reload",
    "rename": "rename",
    "replace": "replace",
    "required": "this field is required",
    "row2 defination": "Toggle second row of footer.",
    "right defination": "Move cursor to right.",
    "run your web app": "Run your web app",
    "save": "Save",
    "save defination": "Save active file",
    "save as": "Save as",
    "save file to run": "Please save this file to run in browser",
    "save here": "Save here",
    "search": "search",
    "search defination": "Search and replace any word in active file",
    "see logs and errors": "See logs and errors",
    "select folder": "Select folder",
    "settings": "Settings",
    "shift defination": "'Shift key' use this for key combinations. Use 'shift + arrow keys' for selection.",
    "show line numbers": "Show line numbers",
    "show hidden files": "Show hidden files",
    "soft tab": "Soft tab",
    "sort by name": "Sort by name",
    "success": "success",
    "tab defination": "'Tab key' use this for indentation and use shift+tab to clear indentation",
    "tab size": "Tab size",
    "text wrap": "Text wrap",
    "theme": "Theme",
    "unable to delete file": "unable to delete file",
    "unable to open file": "Sorry, unable to open file",
    "unable to open folder": "Sorry, unable to open folder",
    "unable to save file": "Sorry, unable to save file",
    "unable to rename": "Sorry, unable to rename",
    "undo defination": "undo",
    "unsaved file warning": "This file is not saved, close anyway?",
    "up defination": "Move cursor upward.",
    "warning": "warning",
    "welcome": "Welcome to Acode editor",
    "use emmet": "Use ememt",
    "use quick tools": "Use quick tools",
    "yes": "Yes"
  },
  "hi-in": {
    "lang": "हिंदी",
    "A1": "टेक्स्ट को सेलेक्ट करने के लिए उस शब्द पर दो बार टैप करे और ड्रैग करे जहा तक आप सेलेक्ट करना चाहते हैं, या फिर SHFT  के को इनेबल कर के एरो कीस का इस्तेमाल करें।",
    "A2": "एम्मेट एक प्लगइन है जो HTML और CSS वर्कफ़्लो में बहुत सुधार करता है। अधिक जानने के लिए https://emmet.io पर जाएं।",
    "A3": "पाठ को काटने, कॉपी और पेस्ट करने के लिए, पहले पाठ का चयन करें और फिर संपादक संदर्भ मेनू पर टैप करें और दबाए रखें।",
    "A4": "फ़ाइल को काटने, कॉपी और पेस्ट करने के लिए, फ़ाइल और फ़ोल्डर विकल्पों के लिए साइड नेविगेशन मेनू में फ़ाइल या फ़ोल्डर पर टैप और होल्ड करें।",
    "A5": "वेब एप्लिकेशन चलाने के लिए अनुक्रमणिका HTML फ़ाइल खोलें और नीचे दाएं कोने में रन बटन पर क्लिक करें।",
    "A6": "त्रुटियों और लॉग को देखने के लिए, पूर्वावलोकन विंडो में नीले फ़्लोटिंग बटन पर क्लिक करें।",
    "about": "एप्लीकेशन के बारे में",
    "about app": "एकोड संपादक एंड्रॉइड के लिए एक स्रोत कोड संपादक है। अजित कुमार (डेल्‍लेवेन जैक) द्वारा विकसित।",
    "active files": "सक्रिय फ़ाइलें",
    "alert": "चेतावनी",
    "app theme": "एप्लीकेशन का थीम",
    "beautify on save": "सेव करने से पहले ब्यूटीफाई करे",
    "cancel": "रद्द करें",
    "create folder error": "क्षमा करें, नया फ़ोल्डर बनाने में असमर्थ",
    "close app": "एप्लिकेशन बंद करें?",
    "clipboard defination": "क्लिपबोर्ड विकल्प जैसे, कट, कॉपी, पेस्ट और सभी का चयन करें और कमांड पैलेट टॉगल करने का विकल्प भी शामिल है",
    "change language": "भाषा बदलें",
    "control file and folders": "फ़ाइलों और फ़ोल्डर को नियंत्रित करें",
    "copy": "कापी",
    "copydown defination": "सक्रिय रेखा को नीचे की ओर कॉपी करें।",
    "copyup defination": "सक्रिय रेखा को ऊपर की ओर कॉपी करें।",
    "cut": "कट",
    "delete": "इसे हटाएं",
    "delete {name}": "{name} को डिलीट करें?",
    "dependencies": "निर्भरता",
    "down defination": "कर्सर को नीचे की ओर ले जाएं।",
    "editor settings": "एडिटर सेटिंग्स",
    "editor theme": "एडिटर का थीम",
    "enter file name": "फ़ाइल का नाम दर्ज करें",
    "enter folder name": "फ़ोल्डर का नाम दर्ज करें",
    "empty folder message": "खाली फ़ोल्डर",
    "enter line number": "लाइन नंबर दर्ज करें",
    "error": "एरर",
    "failed": "असफल",
    "file already exists": "फ़ाइल पहले से ही मौजूद है। ओवरराइट करें?",
    "file changed": " बदल दी गई है, फ़ाइल पुनः लोड करें?",
    "file deleted": "फ़ाइल डिलीट कर दि गई है",
    "file is not supported": "फ़ाइल समर्थित नहीं है",
    "file not supported": "यह फ़ाइल प्रकार समर्थित नहीं है।",
    "file too large": "संभाल करने के लिए फ़ाइल बड़ी है। अधिकतम फ़ाइल आकार की अनुमति है",
    "file renamed": "फ़ाइल का नाम बदल दिया गया है",
    "file saved": "फाइल सेव हो गया",
    "folder added": "फ़ोल्डर जोड़ा गया",
    "folder already added": "फ़ोल्डर पहले से ही जोड़ा गया",
    "font size": "फॉण्ट साइज",
    "goto": "गोटू लाइन",
    "help": "सहायता",
    "icons definition": "आइकन स्पष्टीकरण",
    "info": "जानकारी",
    "language changed": "भाषा को सफलतापूर्वक बदल दिया गया है",
    "left defination": "कर्सर को बाईं ओर ले जाएं।",
    "linting": "वाक्यविन्यास त्रुटि की जाँच करें?",
    "movedown defination": "सक्रिय रेखा को नीचे की ओर ले जाएं।",
    "moveup defination": "सक्रिय रेखा को ऊपर की ओर ले जाएं।",
    "new file": "नई फ़ाइल",
    "new folder": "नया फोल्डर",
    "no editor message": "मेनू से नई फ़ाइल और फ़ोल्डर खोलें या बनाएँ",
    "no": "नहीं",
    "number of unsaved file warning": "बिना सेव की गई फ़ाइलें, फिर भी एप्लिकेशन को बंद करें?",
    "notice": "नोटिस",
    "open file": "फ़ाइल खोलें",
    "open files and folders": "फ़ाइल और फ़ोल्डर खोलें",
    "open folder": "फ़ोल्डर खोलें",
    "ok": "ठीक",
    "paste": "पेस्ट",
    "Q1": "पाठ का चयन कैसे करें?",
    "Q2": "एम्मेट क्या है?",
    "Q3": "टेक्स्ट को कैसे काटें, कॉपी करें और पेस्ट करें?",
    "Q4": "फाइल को कैसे काटें, कॉपी करें और पेस्ट करें?",
    "Q5": "वेब एप्लिकेशन कैसे चलाएं?",
    "Q6": "त्रुटि और लॉग कैसे देखें?",
    "Q7": "मदद चाहिए?",
    "Q8": "प्रतिक्रिया?",
    "qa section": "प्रश्न और उत्तर",
    "read only file": "यह फाइल सेव नहीं की सकती, किर्प्या इसे 'सेव एज' से सेव करे",
    "redo": "रीडू",
    "replace": "इससे बदलें",
    "reload": "रिलोड",
    "rename": 'नाम बदलने',
    "required": "यह फ़ील्ड आवश्यक है",
    "right defination": "कर्सर को दाईं ओर ले जाएं।",
    "row2 defination": "पाद की दूसरी पंक्ति टॉगल करें।",
    "run your web app": "अपना वेब ऐप चलाएं",
    "save": "सेव",
    "save as": "सेव ऐज",
    "save defination": "सक्रिय फ़ाइल को सेव करें",
    "save file to run": "कृपया इस फाइल को ब्राउजर में चलाने के लिए सेव करें",
    "save here": "यहां सेव करें",
    "search": "खोज",
    "search defination": "किसी भी शब्द को खोजें और दूसरे शब्द से बदलें।",
    "see logs and errors": "लॉग और त्रुटियों को देखें",
    "select folder": "फोल्डर का चयन करें",
    "settings": "सेटिंग्स",
    "shift defination": "'शिफ्ट की 'का पर्योग की कॉम्बिनेशंस के लिए करें। चयन के लिए 'शिफ्ट + एरो कीज़' का उपयोग करें।",
    "show line numbers": "लाइन नंबर्स दिखाएं",
    "show hidden files": "छिपी फ़ाइलें देखें",
    "soft tab": "सॉफ्ट टैब",
    "sort by name": "नाम द्वारा क्रमबद्ध करें",
    "success": "सफल",
    "tab size": "टैब साइज",
    "tab defination": "'टैब की' इंडेंटेशन के लिए इसका उपयोग करें और इंडेंटेशन को साफ करने के लिए 'शिफ्ट + टैब' का उपयोग करें",
    "text wrap": "टेक्स्ट व्रैप",
    "theme": "थीम",
    "unable to delete file": "फाइल डिलीट नहीं हो पा रहा है",
    "unable to open file": "क्षमा करें, फ़ाइल खोलने में असमर्थ",
    "unable to open folder": "क्षमा करें, फ़ोल्डर खोलने में असमर्थ",
    "unable to save file": "क्षमा करें, फ़ाइल सेव करने में असमर्थ",
    "unable to rename": "क्षमा करें, नाम बदलने में असमर्थ",
    "undo defination": "पूर्ववत",
    "unsaved file warning": "यह फ़ाइल सेव नहीं गई है, फिर भी फ़ाइल बंद करें",
    "up defination": "कर्सर को ऊपर की ओर ले जाएं।",
    "warning": "ध्यान दे",
    "welcome": "एकोड संपादक में आपका स्वागत है",
    "use emmet": "इमेट का प्रयोग करें",
    "use quick tools": "त्वरित साधनों का उपयोग करें",
    "yes": "हाँ"
  },
  "id-id": {
    "lang": "Indonesian",
    "A1": "Untuk memilih teks, ketuk dua kali di mana Anda ingin mulai memilih dan seret ke posisi di mana Anda ingin mengakhiri pilihan, atau aktifkan tombol shift dan gunakan tombol panah di baris footer kedua untuk memilih teks.",
    "A2": "Emmet adalah plugin yang sangat meningkatkan alur kerja HTML & CSS. Untuk mengetahui lebih lanjut, buka https://emmet.io",
    "A3": "Untuk memotong, menyalin, dan menempelkan teks, pertama pilih teks, lalu ketuk dan tahan untuk menu konteks editor.",
    "A4": "Untuk memotong, menyalin, dan menempel file, ketuk dan tahan file atau folder di menu navigasi samping untuk opsi file dan folder.",
    "A5": "Untuk menjalankan aplikasi web, buka file indeks HTML dan klik tombol run di sudut kanan bawah.",
    "A6": "Untuk melihat kesalahan dan log, klik tombol mengambang biru di jendela pratinjau.",
    "about": "Tentang",
    "about app": "Acode editor adalah editor kode sumber untuk android. Dikembangkan oleh Ajit Kumar (Dellevan Jack).",
    "active files": "file aktif",
    "alert": "Waspada",
    "app theme": "Tema aplikasi",
    "beautify on save": "Mempercantik saat berhemat",
    "cancel": "membatalkan",
    "change language": "Ganti BAHASA",
    "close app": "Tutup aplikasi?",
    "clipboard defination": "Berisi opsi clipboard seperti, memotong, menyalin, menempel dan memilih semua dan juga berisi opsi untuk beralih palet perintah",
    "control file and folders": "Kontrol file dan folder",
    "copy": "salinan",
    "copydown defination": "Salin garis aktif ke bawah.",
    "copyup defination": "Salin garis aktif ke atas.",
    "create folder error": "Maaf, tidak dapat membuat folder baru",
    "cut": "memotong",
    "delete": "menghapus",
    "delete {name}": "hapus {name}?",
    "dependencies": "Ketergantungan",
    "down defination": "Pindahkan kursor ke bawah.",
    "editor settings": "Pengaturan editor",
    "editor theme": "Tema editor",
    "enter file name": "Masukkan nama file",
    "enter folder name": "Masukkan nama folder",
    "empty folder message": "Folder kosong",
    "enter line number": "Masukkan nomor baris",
    "error": "kesalahan",
    "failed": "gagal",
    "file already exists": "File sudah ada. Timpa?",
    "file changed": " telah diubah, memuat ulang file?",
    "file deleted": "file dihapus",
    "file is not supported": "file tidak didukung",
    "file not supported": "Jenis file ini tidak didukung.",
    "file too large": "File terlalu besar untuk ditangani. Ukuran file maks yang diizinkan adalah",
    "file renamed": "diajukan diganti nama",
    "file saved": "file disimpan",
    "folder added": "folder ditambahkan",
    "folder already added": "folder sudah ditambahkan",
    "font size": "Ukuran huruf",
    "goto": "Goto line",
    "help": "Membantu",
    "icons definition": "Definisi ikon",
    "info": "info",
    "language changed": "bahasa telah berhasil diubah",
    "left defination": "Pindahkan kursor ke kiri.",
    "linting": "Periksa kesalahan sintaksis?",
    "movedown defination": "Pindahkan garis aktif ke bawah.",
    "moveup defination": "Pindahkan garis aktif ke atas.",
    "new file": "File baru",
    "new folder": "Folder baru",
    "no": "Tidak",
    "no editor message": "Buka atau buat file dan folder baru dari menu",
    "number of unsaved file warning": "file yang belum disimpan, tutup aplikasi?",
    "notice": "Melihat",
    "open file": "Membuka file",
    "open files and folders": "Buka file dan folder",
    "open folder": "Folder terbuka",
    "ok": "baik",
    "paste": "pasta",
    "Q1": "Bagaimana cara memilih teks?",
    "Q2": "Apa itu emmet?",
    "Q3": "Bagaimana cara memotong, menyalin, dan menempelkan teks?",
    "Q4": "Bagaimana cara memotong, menyalin, dan menempel file?",
    "Q5": "Bagaimana cara menjalankan aplikasi web?",
    "Q6": "Bagaimana cara melihat kesalahan dan log?",
    "Q7": "Butuh bantuan?",
    "Q8": "Umpan balik?",
    "qa section": "Bagian QnA",
    "read only file": "Tidak dapat menyimpan file hanya baca. Silakan coba simpan sebagai",
    "redo defination": "mengulangi",
    "reload": "memuat ulang",
    "rename": "ganti nama",
    "replace": "menggantikan",
    "required": "Bagian ini diperlukan",
    "row2 defination": "Beralih baris kedua dari footer.",
    "right defination": "Pindahkan kursor ke kanan.",
    "run your web app": "Jalankan aplikasi web Anda",
    "save": "Menyimpan",
    "save defination": "Simpan file aktif",
    "save as": "Simpan sebagai",
    "save file to run": "Harap simpan file ini untuk dijalankan di browser",
    "save here": "Simpan di sini",
    "search": "pencarian",
    "search defination": "Cari dan ganti kata apa pun dalam file aktif",
    "see logs and errors": "Lihat log dan kesalahan",
    "select folder": "Pilih folder",
    "settings": "Pengaturan",
    "shift defination": "'Tombol shift' gunakan ini untuk kombinasi tombol. Gunakan 'shift + arrow keys' untuk seleksi.",
    "show line numbers": "Tampilkan nomor baris",
    "show hidden files": "Tampilkan file tersembunyi",
    "soft tab": "Tab lunak",
    "sort by name": "Diurutkan berdasarkan nama",
    "success": "keberhasilan",
    "tab defination": "'Tab key' gunakan ini untuk lekukan dan gunakan shift + tab untuk menghapus lekukan",
    "tab size": "Ukuran tab",
    "text wrap": "Bungkus teks",
    "theme": "Tema",
    "unable to delete file": "tidak dapat menghapus file",
    "unable to open file": "Maaf, tidak dapat membuka file",
    "unable to open folder": "Maaf, tidak dapat membuka folder",
    "unable to save file": "Maaf, tidak dapat menyimpan file",
    "unable to rename": "Maaf, tidak dapat mengganti nama",
    "undo defination": "batalkan",
    "unsaved file warning": "File ini tidak disimpan, tutup?",
    "up defination": "Gerakkan kursor ke atas.",
    "warning": "peringatan",
    "welcome": "Selamat datang di editor Acode",
    "use emmet": "Gunakan ememt",
    "use quick tools": "Gunakan alat cepat",
    "yes": "iya nih"
  }
};

//#region code snippet
const INJECTION = `"use strict";

(function () {
  var style = document.createElement('style');
  document.head.appendChild(style);
  var toggler = document.createElement('c-toggler');
  var clearBtn = document.createElement('c-toggler');
  clearBtn.innerHTML = '&times;';
  clearBtn.onclick = clear;
  clearBtn.style.fontSize = '1.2em';
  clearBtn.style.left = 'calc(100vw - 40px)';
  clearBtn.style.transform = "translate(-2px, 2px)";

  toggler.innerHTML = '&#9888;';
  toggler.style.transform = "translate(2px, 2px)";

  toggler.onclick = function () {
    if (consoleElement.parentElement) {
      document.body.removeChild(clearBtn);
      document.body.removeChild(consoleElement);
    } else {
      document.body.appendChild(clearBtn);
      document.body.appendChild(consoleElement);
    }
  };

  toggler.ontouchstart = function () {
    document.ontouchmove = function (e) {
      toggler.style.transform = "translate(".concat(e.touches[0].clientX - 20, "px, ").concat(e.touches[0].clientY - 20, "px)");
    };

    document.ontouchend = function (e) {
      document.ontouchmove = null;
      document.ontouchend = null;
    };
  };

  var errId = '_c_error' + new Date().getMilliseconds();
  var consoleElement = document.createElement('c-console');
  var counter = {};
  window.__c_toggler__ = toggler;

  function log() {
    if (arguments.length === 0) return;

    var clean = null;
    var error = null;
    var args = Object.values(arguments);
    if(arguments[0] === errId+'error'){
      error = arguments[1];
      args = [errId, error.message];
      clean = error.filename+":"+error.lineno+":"+error.colno;
    }else{
      var err = getErrorObject();
      var caller_line = err.stack.split('\\\\n')[arguments[0] === errId? 4 : 3];
      var index = caller_line.indexOf("at ");
      clean =  caller_line.slice(index + 2, caller_line.length);;
    }


    if(clean.length > 35){
        clean = clean.split('/').slice(-2).join('/');
        if(clean.length > 35){
          clean = '...'+clean.slice(clean.lenght - 35);
        }else{
          clean = '...'+clean;
        }

        if(clean.slice(-1) === ')') clean = clean.slice(0, -1);
    }
    var flag = false;
    var messages = document.createElement('c-message');

    for(let arg of args){
      if (typeof arg === 'string') {
        if (arg === errId) {
          messages.classList.add('error');
          continue;
        }

        if (flag) {
          messages.lastElementChild.setAttribute('style', arg);
          flag = false;
          continue;
        }

        if (/^%c/.test(arg)) flag = true;
        var msg = document.createElement('c-text');
        msg.textContent = arg.replace(/%[a-zA-Z]/, '');
        messages.appendChild(msg);
      } else {
        if (flag) flag = false;

        var _msg = document.createElement('c-text');

        _msg.textContent = JSON.stringify(arg, undefined, 2);
        messages.appendChild(_msg);
      }
    }

    messages.setAttribute('data-stack', clean);
    consoleElement.appendChild(messages);
  }

  function error() {
    if(arguments.lenght === 0) return;
    let error = arguments[0];
    if(arguments[0].constructor.name === 'ErrorEvent'){
      log(errId+'error', error);
      return;
    }
    let args = Object.values(arguments);
    args.unshift(errId);
    log(...args);
  }

  function count() {
    var hash = (arguments[0] || 'default') + '';

    if (!counter[hash]) {
      counter[hash] = 1;
    } else {
      ++counter[hash];
    }

    log("".concat(hash, ": ").concat(counter[hash]));
  }

  function clear() {
    consoleElement.textContent = '';
  }
  function getErrorObject() {
    try {
      throw Error('');
    } catch (err) {
      return err;
    }
  }

  console = {
    log: log,
    error: error,
    count: count,
    clear: clear
  };
  var css = "c-toggler{position:fixed;top:0;left:0;display:flex;height:40px;width:40px;background-color:#99f;align-items:center;justify-content:center;user-select:none;transform-origin:center;border-radius:50%;color:#fff;box-shadow:-2px 2px 8px rgba(0,0,0,.4);z-index:99999}c-toggler:active{box-shadow:-1px 1px 4px rgba(0,0,0,.4)}c-console{box-sizing:border-box;padding-top:65px;overflow-y:auto;position:fixed;top:0;left:0;height:100vh;width:100vw;background-color:#fff;z-index:99998;animation:--page-transition .1s ease 1}c-console::before{position:fixed;top:0;left:0;width:100vw;background-color:white;z-index:999999;content:'Console';display:flex;height:44px;align-items:center;justify-content:center;font-family:Verdana,Geneva,Tahoma,sans-serif;font-weight:900;box-shadow:0 2px 4px rgba(0,0,0,.2);margin-bottom:10px}c-message{position:relative;display:flex;border-bottom:solid 1px #ccc;margin-bottom:35px;font-size:.9em}c-message.error{background-color:#f66;color:#300}c-message.error::after{background-color:#cc4343;color:#fff}c-message::after{content:attr(data-stack);font-family:Verdana,Geneva,Tahoma,sans-serif;position:absolute;top:100%;right:0;display:flex;height:20px;align-items:center;justify-content:flex-end;width:100vw;background-color:#eee;padding:0 5px;box-sizing:border-box;font-size:.8em}c-text{padding:2px;white-space:pre;font-family:Verdana,Geneva,Tahoma,sans-serif;overflow:auto; box-sizing:border-box; max-width: 100vw}@keyframes --page-transition{0%{opacity:0;transform:translate3d(0,50%,0)}100%{opacity:1;transform:translate3d(0,0,0)}}";
  style.textContent = css;
})();`;
//#endregion

const themeList = ["ambiance", "chaos", "chrome", "clouds", "clouds_midnight", "cobalt", "crimson_editor", "dawn", "dracula", "dreamweaver", "eclipse", "github", "gob", "gruvbox", "idle_fingers", "iplastic", "katzenmilch", "kr_theme", "kuroir", "merbivore", "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "solarized_light", "sqlserver", "terminal", "textmate", "tomorrow", "tomorrow_night", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "twilight", "vibrant_ink", "xcode"];

export default {
  FILE_NAME_REGEX,
  INJECTION,
  FONT_SIZE,
  string,
  themeList
};