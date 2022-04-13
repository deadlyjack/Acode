package com.foxdebug.system;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.text.TextUtils.TruncateAt;
import android.util.Base64;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import com.foxdebug.system.Base64Icons;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

public class BrowserDialog extends Dialog {

  public int FILE_SELECT_CODE = 1;
  public ValueCallback<Uri[]> webViewFilePathCallback;
  private CallbackContext callbackContext;
  private CordovaPlugin plugin;
  private Context context;
  private WebView webView;
  private TextView titleText;
  private ImageButton icon;
  private boolean desktopMode = false;
  private boolean consoleEnabled = false;
  private boolean showButtons = true;
  private String url = "";
  private String title = "Browser";
  private String themeType = "light";
  private int backgroundColor = 0xFF000000;
  private int textColor = 0xFFFFFFFF;
  private Bitmap browserIcon;
  private TextView urlText;
  private int padding = 5;
  private int titleHeight = 45;
  private int titleTextHeight = 35;
  private int fontSize = 5;
  private int imageSize = 35;
  private boolean disableCache = false;

  public BrowserDialog(
    CordovaPlugin plugin,
    int bgColor,
    String type,
    boolean showButtons,
    boolean disableCache,
    CallbackContext callbackContext
  ) {
    super(plugin.cordova.getContext(), android.R.style.Theme_NoTitleBar);
    this.callbackContext = callbackContext;
    this.plugin = plugin;
    this.context = plugin.cordova.getContext();
    this.showButtons = showButtons;
    this.padding = this.dpToPixels(this.padding);
    this.titleHeight = this.dpToPixels(this.titleHeight);
    this.imageSize = this.dpToPixels(this.imageSize);
    this.titleTextHeight = this.dpToPixels(this.titleTextHeight);
    this.fontSize = this.dpToPixels(this.fontSize);
    this.disableCache = disableCache;

    this.requestWindowFeature(Window.FEATURE_NO_TITLE);
    this.setCancelable(true);
    this.setTheme(bgColor, type);
    this.init();
  }

  public void onBackPressed() {
    if (consoleEnabled) {
      consoleEnabled = false;
      webView.loadUrl(
        "javascript:document.dispatchEvent(new CustomEvent('hideconsole'))"
      );
      return;
    }

    if (webView.canGoBack()) {
      icon.setImageBitmap(browserIcon);
      webView.goBack();
      url = webView.getOriginalUrl();
    } else {
      dismiss();
    }
  }

  public void init() {
    browserIcon =
      convertBase64ToBitmap(
        themeType.equals("light")
          ? Base64Icons.BROWSER_DARK
          : Base64Icons.BROWSER
      );

    //main
    LinearLayout main = new LinearLayout(context);
    main.setOrientation(LinearLayout.VERTICAL);
    main.setFocusable(true);
    main.setFocusableInTouchMode(true);

    //title
    LinearLayout titleLayout = new LinearLayout(context);
    titleLayout.setOrientation(LinearLayout.HORIZONTAL);
    titleLayout.setBackgroundColor(backgroundColor);
    titleLayout.setLayoutParams(
      new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, this.titleHeight)
    );
    titleLayout.setHorizontalGravity(Gravity.LEFT);
    titleLayout.setVerticalGravity(Gravity.TOP);

    //stack progressbar on top of icon
    //progress bar
    ProgressBar progressBar = new ProgressBar(
      context,
      null,
      android.R.attr.progressBarStyle
    );
    progressBar.setLayoutParams(
      new LinearLayout.LayoutParams(this.imageSize, this.imageSize, 0)
    );

    //icon
    icon = createIcon(browserIcon, "Favicon");
    icon.setOnClickListener(
      new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          //refresh webview
          webView.reload();
        }
      }
    );

    //stack progressbar on top of icon
    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
      LayoutParams.WRAP_CONTENT,
      LayoutParams.WRAP_CONTENT
    );
    FrameLayout frame = new FrameLayout(context);
    params.gravity = Gravity.CENTER_VERTICAL;
    frame.setLayoutParams(params);
    frame.addView(icon);
    frame.addView(progressBar);

    //title text
    if (showButtons) {
      titleText = createEditText(title);
    } else {
      titleText = createTextView(title);
    }

    //toggle console icon
    ImageButton toggleConsoleButton = createIcon(
      themeType.equals("light")
        ? Base64Icons.CONSOLE_DARK
        : Base64Icons.CONSOLE,
      "toggle console"
    );
    toggleConsoleButton.setOnClickListener(
      new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          consoleEnabled = !consoleEnabled;
          String event = consoleEnabled ? "show" : "hide";
          webView.loadUrl(
            "javascript:document.dispatchEvent(new CustomEvent('" +
            event +
            "console'))"
          );
          setActive(toggleConsoleButton, consoleEnabled);
        }
      }
    );

    //toggle desktopmode icon
    ImageButton toggleDesktopModeButton = createIcon(
      themeType.equals("light")
        ? Base64Icons.DESKTOP_DARK
        : Base64Icons.DESKTOP,
      "toggle desktop mode"
    );
    toggleDesktopModeButton.setOnClickListener(
      new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          desktopMode = !desktopMode;
          setDesktopMode(desktopMode);
          setActive(toggleDesktopModeButton, desktopMode);
        }
      }
    );

    //open in browser icon
    ImageButton openInBrowserButton = createIcon(
      themeType.equals("light")
        ? Base64Icons.OPEN_IN_APP_DARK
        : Base64Icons.OPEN_IN_APP,
      "open in browser"
    );
    openInBrowserButton.setOnClickListener(
      new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          dismiss();

          Uri webpage = Uri.parse(url);
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            webpage = Uri.parse("http://" + url);
          }

          Intent browserIntent = new Intent(Intent.ACTION_VIEW, webpage);
          context.startActivity(browserIntent);
          if (callbackContext != null) {
            callbackContext.success("onOpenExternalBrowser: " + url);
          }
        }
      }
    );

    titleLayout.addView(frame);
    titleLayout.addView(titleText);
    if (showButtons) {
      titleLayout.addView(toggleDesktopModeButton);
      titleLayout.addView(openInBrowserButton);
    }

    //webview
    webView = new WebView(context);
    webView.setFocusable(true);
    webView.setFocusableInTouchMode(true);
    webView.setLayoutParams(
      new LinearLayout.LayoutParams(
        LayoutParams.MATCH_PARENT,
        LayoutParams.MATCH_PARENT
      )
    );

    webView.setWebChromeClient(
      new WebChromeClient() {
        @Override
        public void onReceivedTitle(WebView view, String title) {
          super.onReceivedTitle(view, title);
          setTitle(title);
        }

        @Override
        public void onReceivedIcon(WebView view, Bitmap favicon) {
          super.onReceivedIcon(view, favicon);
          icon.setImageBitmap(favicon);
        }

        public boolean onShowFileChooser(
          WebView webView,
          ValueCallback<Uri[]> filePathCallback,
          WebChromeClient.FileChooserParams fileChooserParams
        ) {
          if (webViewFilePathCallback != null) {
            webViewFilePathCallback.onReceiveValue(null);
          }

          Intent selectDocument = new Intent(Intent.ACTION_GET_CONTENT);
          Boolean isMultiple =
            (
              fileChooserParams.getMode() ==
              WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE
            );

          webViewFilePathCallback = filePathCallback;
          selectDocument.addCategory(Intent.CATEGORY_OPENABLE);
          selectDocument.setType("*/*");

          if (isMultiple) {
            selectDocument.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
          }

          plugin.cordova.startActivityForResult(
            plugin,
            Intent.createChooser(selectDocument, "Select File"),
            FILE_SELECT_CODE
          );

          return true;
        }
      }
    );

    webView.setWebViewClient(
      new WebViewClient() {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
          setUrl(url);
          icon.setImageBitmap(browserIcon);
          // show progress bar
          progressBar.setVisibility(View.VISIBLE);
          return false;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
          super.onPageStarted(view, url, favicon);
          // show progress bar
          progressBar.setVisibility(View.VISIBLE);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
          super.onPageFinished(view, url);
          // hide progress bar
          progressBar.setVisibility(View.GONE);
        }

        @Override
        public void onLoadResource(WebView view, String url) {
          if (!showButtons) return;
          setDesktopMode(desktopMode);
          webView.evaluateJavascript(
            "sessionStorage.getItem('__console_available')",
            new ValueCallback<String>() {
              @Override
              public void onReceiveValue(String value) {
                titleLayout.post(
                  new Runnable() {
                    @Override
                    public void run() {
                      if (!value.equals("null")) {
                        if (
                          toggleConsoleButton.getParent() == null
                        ) titleLayout.addView(toggleConsoleButton);
                        return;
                      }

                      titleLayout.removeView(toggleConsoleButton);
                    }
                  }
                );
              }
            }
          );
        }
      }
    );

    WebSettings settings = webView.getSettings();

    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowContentAccess(true);
    settings.setDisplayZoomControls(false);

    main.addView(titleLayout);
    main.addView(webView);
    setContentView(main);
  }

  private TextView createTextView(String text) {
    TextView textView = new TextView(context);
    setTextViewProperties(textView, this.titleHeight);
    textView.setText(text);
    return textView;
  }

  private EditText createEditText(String text) {
    EditText editText = new EditText(context);
    GradientDrawable background = new GradientDrawable();

    int radius = this.titleTextHeight / 2;
    background.setCornerRadius(radius);
    background.setColor(themeType.equals("light") ? 0x11000000 : 0x11ffffff);
    editText.setBackground(background);

    setTextViewProperties(editText, this.titleTextHeight);
    editText.setText(text);
    editText.setPadding(radius, 0, radius, 0);
    editText.setTextSize(this.fontSize < 10 ? 10 : this.fontSize);
    editText.setInputType(android.text.InputType.TYPE_TEXT_VARIATION_URI);
    editText.setImeOptions(EditorInfo.IME_ACTION_GO);

    editText.setOnFocusChangeListener(
      new View.OnFocusChangeListener() {
        @Override
        public void onFocusChange(View v, boolean hasFocus) {
          if (hasFocus) {
            titleText.setText(url);
          } else {
            titleText.setText(title);
          }
        }
      }
    );

    editText.setOnEditorActionListener(
      new EditText.OnEditorActionListener() {
        @Override
        public boolean onEditorAction(
          TextView v,
          int actionId,
          android.view.KeyEvent event
        ) {
          if (
            actionId == EditorInfo.IME_ACTION_GO ||
            event.getKeyCode() == KeyEvent.KEYCODE_ENTER
          ) {
            String url = v.getText().toString();
            if (url.startsWith("http://") || url.startsWith("https://")) {
              title = url;
              setUrl(url);
              editText.clearFocus();
              InputMethodManager imm = (InputMethodManager) getContext()
                .getSystemService(Context.INPUT_METHOD_SERVICE);
              imm.hideSoftInputFromWindow(editText.getWindowToken(), 0);
              return true;
            }
          }
          return false;
        }
      }
    );

    return editText;
  }

  private TextView setTextViewProperties(TextView textView, int height) {
    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
      LayoutParams.FILL_PARENT,
      height,
      1
    );
    params.gravity = Gravity.CENTER_VERTICAL;
    textView.setMaxLines(1);
    textView.setEllipsize(TruncateAt.END);
    textView.setSingleLine(true);
    textView.setHorizontallyScrolling(true);
    textView.setTextColor(textColor);
    textView.setLayoutParams(params);
    textView.setGravity(Gravity.CENTER_VERTICAL);
    return textView;
  }

  private void setTheme(int bgColor, String type) {
    try {
      if (type != null) themeType = type;
      textColor = type.equals("light") ? 0xFF000000 : 0xFFFFFFFF;
      backgroundColor = bgColor;

      if (Build.VERSION.SDK_INT >= 21) {
        final Window window = getWindow();
        // Method and constants not available on all SDKs but we want to be able to compile this code with any SDK
        window.clearFlags(0x04000000); // SDK 19: WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(0x80000000); // SDK 21: WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        try {
          // Using reflection makes sure any 5.0+ device will work without having to compile with SDK level 21

          window
            .getClass()
            .getMethod("setNavigationBarColor", int.class)
            .invoke(window, backgroundColor);

          window
            .getClass()
            .getMethod("setStatusBarColor", int.class)
            .invoke(window, backgroundColor);

          setStatusBarStyle(window);
          setNavigationBarStyle(window);
        } catch (IllegalArgumentException ignore) {} catch (Exception ignore) {}
      }
    } catch (Exception e) {}
  }

  private void setStatusBarStyle(final Window window) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      View decorView = window.getDecorView();
      int uiOptions = decorView.getSystemUiVisibility();

      if (themeType.equals("light")) {
        decorView.setSystemUiVisibility(
          uiOptions | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        );
        return;
      }
    }
  }

  private void setNavigationBarStyle(final Window window) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      View decorView = window.getDecorView();
      int uiOptions = decorView.getSystemUiVisibility();

      if (themeType.equals("light")) {
        decorView.setSystemUiVisibility(uiOptions | 0x80000000 | 0x00000010);
        return;
      }
    }
  }

  private void setDesktopMode(boolean enabled) {
    final WebSettings webSettings = webView.getSettings();

    webView.loadUrl(
      "javascript:!function(e){var t,n,o;window.innerWidth>=window.innerHeight||(t=1024/innerWidth,(n=document.querySelector(\"meta[name=viewport]\"))||((n=document.createElement(\"meta\")).name=\"viewport\",document.head.appenChild(n)),e?(o=window.innerHeight*t,sessionStorage.setItem(\"__old_viewport_content\",n.content),n.content=\"width=1024, height=\"+o):(o=sessionStorage.__old_viewport_content)&&(n.content=o))}(" +
      desktopMode +
      ");"
    );

    webSettings.setUseWideViewPort(enabled);
    webSettings.setLoadWithOverviewMode(enabled);
    webSettings.setSupportZoom(enabled);
    webSettings.setBuiltInZoomControls(enabled);
  }

  public void setUrl(String url) {
    this.url = url;
    setTitle(url);
    webView.loadUrl(url);
  }

  public void setTitle(String title) {
    this.title = title;
    titleText.setText(title);
  }

  @Override
  public void dismiss() {
    super.dismiss();
    if (webView != null) {
      if (disableCache) webView.clearCache(true);
      webView.destroy();
    }
  }

  public void show(String url, String title) {
    setUrl(url);
    setTitle(title);
    super.show();
  }

  private ImageButton createIcon(String icon, String contentDescription) {
    return createIcon(convertBase64ToBitmap(icon), contentDescription);
  }

  private ImageButton createIcon(Bitmap icon, String contentDescription) {
    ImageButton button = new ImageButton(context);
    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
      this.imageSize,
      this.imageSize,
      0
    );
    params.gravity = Gravity.CENTER_VERTICAL;
    params.setMargins(0, 0, this.dpToPixels(2), 0);
    button.setBackgroundDrawable(null);
    button.setImageBitmap(icon);
    button.setContentDescription(contentDescription);
    button.setLayoutParams(params);
    button.setScaleType(ImageView.ScaleType.FIT_CENTER);
    button.setAdjustViewBounds(true);
    int padding = this.dpToPixels(10);
    button.setPadding(padding, padding, padding, padding);
    return button;
  }

  private Bitmap convertBase64ToBitmap(String icon) {
    byte[] decodedIcon = Base64.decode(icon, Base64.DEFAULT);
    Bitmap bitmap = BitmapFactory.decodeByteArray(
      decodedIcon,
      0,
      decodedIcon.length
    );
    return bitmap;
  }

  private void setActive(View view, boolean active) {
    GradientDrawable border = new GradientDrawable();
    border.setCornerRadius(8);
    border.setColor(0x00FFFFFF); //white background
    border.setStroke(4, 0xFF3399ff); //black border with full opacity
    view.setBackground(active ? border : null);
  }

  private int dpToPixels(int dipValue) {
    int value = (int) TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      (float) dipValue,
      this.context.getResources().getDisplayMetrics()
    );

    return value;
  }
}
