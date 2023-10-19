package com.foxdebug.system;

import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.text.TextUtils.TruncateAt;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.Menu;
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
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.TextView;
import com.foxdebug.acode.R;
import com.foxdebug.system.Emulator;
import com.foxdebug.system.Ui;
import com.foxdebug.system.Ui.Icons;
import com.foxdebug.system.Ui.Theme;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

public class BrowserDialog extends Dialog {

  public int FILE_SELECT_CODE = 1;

  private Context context;

  private WebView webView;
  private TextView urlText;
  private Emulator deviceEmulator;
  private LinearLayout main;
  private PopupWindow popup;
  private ImageView favicon;
  private LinearLayout menu;
  private TextView titleText;
  private MenuItem toggleConsole;
  private MenuItem toggleControls;
  private MenuItem toggleDesktopMode;
  private ProgressBar loading;
  private Theme theme;

  private CordovaPlugin plugin;
  private CallbackContext callbackContext;

  private boolean showButtons = true;
  private boolean disableCache = false;
  private boolean dimensionChanged = false;

  private String url = "";
  private String title = "Browser";

  private int padding = 5;
  private int fontSize = 5;
  private int imageSize = 35;
  private int titleHeight = 45;
  private int titleTextHeight = 35;

  public ValueCallback<Uri[]> webViewFilePathCallback;

  public BrowserDialog(
    CordovaPlugin plugin,
    Theme theme,
    int systemBarColor,
    boolean showButtons,
    boolean disableCache,
    CallbackContext callbackContext
  ) {
    super(plugin.cordova.getContext(), android.R.style.Theme_NoTitleBar);
    this.theme = theme;
    this.plugin = plugin;
    this.callbackContext = callbackContext;
    this.context = plugin.cordova.getContext();
    this.showButtons = showButtons;
    this.padding = Ui.dpToPixels(context, this.padding);
    this.titleHeight = Ui.dpToPixels(context, this.titleHeight);
    this.imageSize = Ui.dpToPixels(context, this.imageSize);
    this.titleTextHeight = Ui.dpToPixels(context, this.titleTextHeight);
    this.fontSize = Ui.dpToPixels(context, this.fontSize);
    this.disableCache = disableCache;

    this.requestWindowFeature(Window.FEATURE_NO_TITLE);
    this.setCancelable(true);
    this.setTheme(systemBarColor);
    this.init();
  }

  @Override
  public void dismiss() {
    super.dismiss();
    if (webView != null) {
      if (disableCache) webView.clearCache(true);
      webView.destroy();
    }
  }

  public void onBackPressed() {
    if (toggleConsole.checked) {
      toggleConsole.setChecked(false);
      setConsoleVisible(false);
      return;
    }

    if (webView.canGoBack()) {
      webView.goBack();
      url = webView.getOriginalUrl();
    } else {
      dismiss();
    }
  }

  public void init() {
    //create menu button using icon font
    WebSettings settings;
    ImageButton menuIcon;
    ImageButton refreshIcon;
    LinearLayout titleLayout;
    FrameLayout faviconFrame;
    LinearLayout webViewContainer;
    LinearLayout.LayoutParams faviconFrameParams;

    favicon = createIcon(Icons.LOGO);
    menuIcon = createIconButton(Icons.MORE_VERT);
    menuIcon.setOnClickListener(
      new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          showPopupMenu(v);
        }
      }
    );

    refreshIcon = createIconButton(Icons.REFRESH);
    refreshIcon.setOnClickListener(
      new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          webView.reload();
        }
      }
    );

    //stack progress bar on top of icon
    //progress bar
    loading = new ProgressBar(context, null, android.R.attr.progressBarStyle);
    loading.setLayoutParams(
      new LinearLayout.LayoutParams(this.imageSize, this.imageSize, 0)
    );

    //stack progress bar on top of icon
    faviconFrame = new FrameLayout(context);
    faviconFrameParams =
      new LinearLayout.LayoutParams(
        LayoutParams.WRAP_CONTENT,
        LayoutParams.WRAP_CONTENT
      );
    faviconFrameParams.gravity = Gravity.CENTER_VERTICAL;
    faviconFrame.setLayoutParams(faviconFrameParams);
    faviconFrame.addView(favicon);
    faviconFrame.addView(loading);

    //title text
    if (showButtons) {
      titleText = createEditText(title);
    } else {
      titleText = createTextView(title);
    }

    titleLayout = createTile();
    titleLayout.addView(faviconFrame);
    titleLayout.addView(titleText);
    if (showButtons) {
      titleLayout.addView(refreshIcon);
      titleLayout.addView(menuIcon);
    }

    //webview
    webView = new WebView(context);
    webView.setFocusable(true);
    webView.setFocusableInTouchMode(true);
    webView.setBackgroundColor(theme.get("primaryColor"));
    fitWebViewToScreen();

    webView.setWebChromeClient(new DialogChromeClient(this, plugin));
    webView.setWebViewClient(new DialogWebViewClient(this));

    settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowContentAccess(true);
    settings.setDisplayZoomControls(false);

    webViewContainer = new LinearLayout(context);
    // center webview
    webViewContainer.setGravity(Gravity.CENTER);
    webViewContainer.setLayoutParams(
      new LinearLayout.LayoutParams(
        LayoutParams.MATCH_PARENT,
        LayoutParams.MATCH_PARENT,
        1
      )
    );
    webViewContainer.setBackgroundColor(theme.get("primaryColor"));
    webViewContainer.addView(webView);

    main = new LinearLayout(context);
    main.setOrientation(LinearLayout.VERTICAL);
    main.setFocusableInTouchMode(true);
    main.setFocusable(true);
    main.addView(titleLayout);
    main.addView(webViewContainer);
    setContentView(main);

    if (popup == null) {
      createMenu();
    }
  }

  /**
   * Show popup at top right corner with custom view
   * Set the position of the popup relative to the anchor view
   */
  private void showPopupMenu(View view) {
    int x = view.getLeft();
    int y = view.getTop();

    popup.showAtLocation(view, Gravity.TOP | Gravity.RIGHT, padding, padding);
  }

  private void createMenu() {
    int padding = Ui.dpToPixels(context, 4);
    int borderRadius = Ui.dpToPixels(context, 8);

    MenuItem exit;
    MenuItem openInBrowser;
    GradientDrawable border;
    MenuItem toggleDisableCache;

    toggleConsole = menuItem(Icons.TERMINAL, "Console", true);
    toggleConsole.setChecked(false);
    toggleConsole.setOnClickListener(
      new OnMenuClickListener() {
        @Override
        public void onClick(MenuItem v) {
          setConsoleVisible(v.checked);
        }
      }
    );

    toggleControls = menuItem(Icons.DEVICES, "Devices", true);
    toggleControls.setChecked(false);
    toggleControls.setOnClickListener(
      new OnMenuClickListener() {
        @Override
        public void onClick(MenuItem v) {
          if (deviceEmulator == null) {
            createDeviceEmulatorLayout();
          }

          if (v.checked) {
            main.addView(deviceEmulator);
            setConsoleButtonVisible(false);
            if (dimensionChanged) {
              fitWebViewTo(
                deviceEmulator.getWidthProgress(),
                deviceEmulator.getHeightProgress()
              );
            }
          } else {
            main.removeView(deviceEmulator);
            setConsoleButtonVisible(!toggleDesktopMode.checked);
            if (dimensionChanged) {
              fitWebViewToScreen();
            }
          }
        }
      }
    );

    openInBrowser = menuItem(Icons.OPEN_IN_BROWSER, "Open in Browser");
    openInBrowser.setOnClickListener(
      new OnMenuClickListener() {
        @Override
        public void onClick(MenuItem v) {
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

    toggleDesktopMode = menuItem(Icons.DESKTOP, "Desktop Mode", true);
    toggleDesktopMode.setChecked(false);
    toggleDesktopMode.setOnClickListener(
      new OnMenuClickListener() {
        @Override
        public void onClick(MenuItem v) {
          setDesktopMode(v.checked);
        }
      }
    );

    exit = menuItem(Icons.EXIT, "Exit");
    exit.setOnClickListener(
      new OnMenuClickListener() {
        @Override
        public void onClick(MenuItem v) {
          dismiss();
        }
      }
    );

    toggleDisableCache = menuItem(Icons.NO_CACHE, "Disable Cache", true);
    toggleDisableCache.setChecked(false);
    toggleDisableCache.setOnClickListener(
      new OnMenuClickListener() {
        @Override
        public void onClick(MenuItem v) {
          disableCache = v.checked;
          webView
            .getSettings()
            .setCacheMode(
              disableCache
                ? WebSettings.LOAD_NO_CACHE
                : WebSettings.LOAD_DEFAULT
            );
        }
      }
    );

    border = new GradientDrawable();
    border.setColor(theme.get("popupBackgroundColor"));
    border.setCornerRadius(borderRadius);

    menu = new LinearLayout(context);
    menu.setOrientation(LinearLayout.VERTICAL);
    menu.addView(openInBrowser);
    menu.addView(toggleDesktopMode);
    menu.addView(toggleControls);
    menu.addView(toggleDisableCache);
    menu.addView(exit);
    menu.setBackgroundDrawable(border);
    menu.setPadding(padding, padding, padding, padding);

    popup = new PopupWindow(context);
    popup.setElevation(10);
    popup.setFocusable(true);
    popup.setContentView(menu);
    popup.setBackgroundDrawable(border);
    popup.setAnimationStyle(R.style.PopupAnimation);
  }

  private void createDeviceEmulatorLayout() {
    BrowserDialog dialog = this;
    deviceEmulator = new Emulator(context, theme);
    deviceEmulator.setReference(webView);
    deviceEmulator.setChangeListener(
      new Emulator.Callback() {
        @Override
        public void onChange(int width, int height) {
          dimensionChanged = true;
          fitWebViewTo(width, height);
        }

        @Override
        public void setDesktopMode(boolean enabled) {
          dialog.setDesktopMode(enabled);
        }

        @Override
        public boolean getDesktopMode() {
          return toggleDesktopMode.checked;
        }
      }
    );
  }

  private void setTileStyle(LinearLayout tile) {
    setTileStyle(tile, titleHeight);
  }

  private void setTileStyle(LinearLayout tile, int height) {
    tile.setOrientation(LinearLayout.HORIZONTAL);
    tile.setBackgroundColor(theme.get("primaryColor"));
    tile.setLayoutParams(
      new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, height)
    );
    tile.setHorizontalGravity(Gravity.LEFT);
    tile.setVerticalGravity(Gravity.TOP);
  }

  private void setTextViewProperties(TextView textView, int height) {
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
    textView.setTextColor(theme.get("primaryTextColor"));
    textView.setLayoutParams(params);
    textView.setGravity(Gravity.CENTER_VERTICAL);
  }

  private void setTheme(int systemBarColor) {
    try {
      Icons.setColor(theme.get("popupIconColor"));
      Icons.setSize(Ui.dpToPixels(context, 18));
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
            .invoke(window, systemBarColor);

          window
            .getClass()
            .getMethod("setStatusBarColor", int.class)
            .invoke(window, systemBarColor);

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
      String themeType = theme.getType();

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
      String themeType = theme.getType();

      if (themeType.equals("light")) {
        decorView.setSystemUiVisibility(uiOptions | 0x80000000 | 0x00000010);
        return;
      }
    }
  }

  private void setDesktopMode(boolean enabled) {
    Log.d("BrowserDialog", "setDesktopMode: " + enabled);
    if (enabled && !toggleDesktopMode.checked) {
      toggleDesktopMode.setChecked(true);
    } else if (!enabled && toggleDesktopMode.checked) {
      toggleDesktopMode.setChecked(false);
    }

    final WebSettings webSettings = webView.getSettings();
    int width = webView.getMeasuredWidth();
    int height = webView.getMeasuredHeight();
    webSettings.setUserAgentString(
      enabled
        ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
        : null
    );

    if (enabled) {
      updateViewportDimension(width, height);
      setConsoleButtonVisible(false);
    } else {
      updateViewportDimension(0, 0);
      setConsoleButtonVisible(!toggleControls.checked);
    }

    webSettings.setLoadWithOverviewMode(enabled);
    webSettings.setUseWideViewPort(enabled);
    webSettings.setLoadWithOverviewMode(enabled);
    webSettings.setSupportZoom(enabled);
    webSettings.setBuiltInZoomControls(enabled);
    webView.reload();
  }

  public void setDesktopMode() {
    if (toggleDesktopMode.checked) {
      int width = webView.getMeasuredWidth();
      int height = webView.getMeasuredHeight();
      updateViewportDimension(width, height);
    }
  }

  public void setUrl(String url) {
    this.url = url;
    setTitle(url);
    setProgressBarVisible(true);
    webView.loadUrl(url);
  }

  public void setTitle(String title) {
    this.title = title;
    titleText.setText(title);
  }

  public void setConsoleVisible(boolean visible) {
    String event = visible ? "show" : "hide";
    webView.loadUrl(
      "javascript:document.dispatchEvent(new CustomEvent('" +
      event +
      "console'))"
    );
  }

  public void setConsoleButtonVisible(boolean visible) {
    if (toggleConsole == null) return;
    View parent = (View) toggleConsole.getParent();
    if (
      visible &&
      parent == null &&
      !toggleDesktopMode.checked &&
      !toggleControls.checked
    ) {
      // add at second last position
      menu.addView(toggleConsole, menu.getChildCount() - 1);
      return;
    }

    if (!visible && parent != null) {
      menu.removeView(toggleConsole);
    }

    setConsoleVisible(false);
    toggleConsole.setChecked(false);
  }

  public void setFavicon(Bitmap icon) {
    favicon.setImageBitmap(icon);
  }

  public void setProgressBarVisible(boolean visible) {
    loading.setVisibility(visible ? View.VISIBLE : View.GONE);
  }

  private void updateViewportDimension(int width, int height) {
    String script =
      "!function(){var e=document.head;if(e){var t=document.querySelector('meta[name=viewport]');t&&e.removeChild(t),(t=document.createElement('meta')).name='viewport',t.content='width=%s, height=%s, initial-scale=%s',e.appendChild(t)}}();";
    String w = "device-width";
    String h = "device-height";
    String r = "1";
    if (width > 0) {
      w = String.valueOf(width);
      r = "document.documentElement.clientWidth/" + w;
      h = "";
    }

    if (height > 0) {
      h = String.valueOf(height);
    }

    webView.evaluateJavascript(String.format(script, w, h, r), null);
  }

  private void fitWebViewToScreen() {
    webView.setLayoutParams(
      new LinearLayout.LayoutParams(
        LayoutParams.MATCH_PARENT,
        LayoutParams.MATCH_PARENT
      )
    );
  }

  private void fitWebViewTo(int width, int height) {
    webView.setLayoutParams(new LinearLayout.LayoutParams(width, height));
    updateViewportDimension(width, height);
  }

  public void show(String url, String title) {
    setUrl(url);
    setTitle(title);
    super.show();
  }

  private void styleIcon(ImageView view) {
    int padding = Ui.dpToPixels(context, 7);
    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
      imageSize,
      imageSize
    );

    params.gravity = Gravity.CENTER_VERTICAL;
    view.setBackgroundDrawable(null);
    view.setLayoutParams(params);
    view.setScaleType(ImageView.ScaleType.FIT_CENTER);
    view.setAdjustViewBounds(true);
    view.setPadding(padding, padding, padding, padding);
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
    String themeType = theme.getType();

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

  private LinearLayout createTile() {
    return createTile(titleHeight);
  }

  private LinearLayout createTile(int height) {
    LinearLayout tile = new LinearLayout(context);
    setTileStyle(tile, height);
    return tile;
  }

  private MenuItem menuItem(String icon, String text) {
    return menuItem(icon, text, false);
  }

  private MenuItem menuItem(String icon, String text, boolean hasTail) {
    int paddingLeft = 0;
    int paddingRight = Ui.dpToPixels(context, 10);
    int paddingVertical = Ui.dpToPixels(context, 5);
    MenuItem menuItem = new MenuItem(context);
    menuItem.setIcon(createIcon(icon));
    menuItem.setText(text, theme.get("popupTextColor"));
    menuItem.setBackgroundColor(theme.get("popupBackgroundColor"));
    setTileStyle(menuItem);

    if (!hasTail) {
      paddingRight += imageSize;
    }

    menuItem.setPadding(
      paddingLeft,
      paddingVertical,
      paddingRight,
      paddingVertical
    );
    return menuItem;
  }

  private ImageButton createIconButton(String icon) {
    Bitmap bitmap = Icons.get(context, icon);
    ImageButton button = createIconButton(bitmap);
    return button;
  }

  private ImageButton createIconButton(Bitmap icon) {
    ImageButton button = new ImageButton(context);
    button.setImageBitmap(icon);
    styleIcon(button);
    return button;
  }

  private ImageView createIcon(String code) {
    Bitmap bitmap = Icons.get(context, code);
    ImageView icon = new ImageView(context);
    icon.setImageBitmap(bitmap);
    styleIcon(icon);
    return icon;
  }
}

class DialogWebViewClient extends WebViewClient {

  private BrowserDialog dialog;

  public DialogWebViewClient(BrowserDialog dialog) {
    super();
    this.dialog = dialog;
  }

  @Override
  public boolean shouldOverrideUrlLoading(WebView view, String url) {
    dialog.setUrl(url);
    dialog.setProgressBarVisible(true);
    return false;
  }

  @Override
  public void onPageStarted(WebView view, String url, Bitmap icon) {
    super.onPageStarted(view, url, icon);
    dialog.setProgressBarVisible(true);
  }

  @Override
  public void onPageFinished(WebView view, String url) {
    super.onPageFinished(view, url);
    dialog.setProgressBarVisible(false);
  }

  @Override
  public void onLoadResource(WebView view, String url) {
    dialog.setDesktopMode();
    view.evaluateJavascript(
      "sessionStorage.getItem('__console_available')",
      new ValueCallback<String>() {
        @Override
        public void onReceiveValue(String value) {
          if (!value.equals("null")) {
            dialog.setConsoleButtonVisible(true);
            return;
          }
          dialog.setConsoleButtonVisible(false);
        }
      }
    );
  }
}

class DialogChromeClient extends WebChromeClient {

  BrowserDialog dialog;
  CordovaPlugin plugin;

  public DialogChromeClient(BrowserDialog dialog, CordovaPlugin plugin) {
    super();
    this.dialog = dialog;
    this.plugin = plugin;
  }

  @Override
  public void onReceivedTitle(WebView view, String title) {
    super.onReceivedTitle(view, title);
    dialog.setTitle(title);
  }

  @Override
  public void onReceivedIcon(WebView view, Bitmap icon) {
    super.onReceivedIcon(view, icon);
    dialog.setFavicon(icon);
  }

  public boolean onShowFileChooser(
    WebView webView,
    ValueCallback<Uri[]> filePathCallback,
    WebChromeClient.FileChooserParams fileChooserParams
  ) {
    if (dialog.webViewFilePathCallback != null) {
      dialog.webViewFilePathCallback.onReceiveValue(null);
    }

    Intent selectDocument = new Intent(Intent.ACTION_GET_CONTENT);
    Boolean isMultiple =
      (
        fileChooserParams.getMode() ==
        WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE
      );

    dialog.webViewFilePathCallback = filePathCallback;
    selectDocument.addCategory(Intent.CATEGORY_OPENABLE);
    selectDocument.setType("*/*");

    if (isMultiple) {
      selectDocument.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
    }

    plugin.cordova.startActivityForResult(
      plugin,
      Intent.createChooser(selectDocument, "Select File"),
      dialog.FILE_SELECT_CODE
    );

    return true;
  }
}

class MenuItem extends LinearLayout {

  private Context context;

  private Boolean toggleOnClick = true;

  public Boolean checked = false;

  public int radioGroup;
  public CheckBox checkBox;
  public RadioButton radioButton;

  public MenuItem(Context context) {
    super(context);
    this.context = context;
    this.setOrientation(LinearLayout.HORIZONTAL);
    this.setClickable(true);
    this.addView(new ImageView(context));
    this.addView(new TextView(context));
  }

  public void setIcon(ImageView icon) {
    // add at beginning
    this.addView(icon, 0);
  }

  public void setText(String text, int textColor) {
    TextView textView = new TextView(context);
    LinearLayout.LayoutParams textViewParams = new LinearLayout.LayoutParams(
      LayoutParams.FILL_PARENT,
      LayoutParams.MATCH_PARENT,
      1
    );
    textView.setText(text);
    textView.setTextColor(textColor);
    textView.setGravity(Gravity.CENTER_VERTICAL);
    textView.setLayoutParams(textViewParams);
    this.addView(textView, 1);
  }

  public void setChecked(boolean checked, boolean toggleOnClick) {
    this.checked = checked;
    this.toggleOnClick = toggleOnClick;
    this.setChecked(checked, true);
  }

  public void setChecked(boolean checked) {
    if (checkBox != null) {
      this.checked = checked;
      checkBox.setChecked(checked);
      return;
    }

    this.checkBox = new CheckBox(context);
    checkBox.setChecked(checked);
    checkBox.setEnabled(false);
    checkBox.setClickable(false);
    this.addView(checkBox);
  }

  public void setRadioChecked(
    boolean checked,
    int group,
    boolean toggleOnClick
  ) {
    this.checked = checked;
    this.toggleOnClick = toggleOnClick;
    this.setRadioChecked(checked, group);
  }

  public void setRadioChecked(boolean checked, int group) {
    if (radioButton != null) {
      radioButton.setChecked(checked);
      return;
    }
    this.radioGroup = group;
    this.radioButton = new RadioButton(context);
    radioButton.setChecked(checked);
    radioButton.setEnabled(false);
    radioButton.setClickable(false);
    this.addView(radioButton);
  }

  public void setOnClickListener(OnMenuClickListener listener) {
    MenuItem self = this;
    this.setOnClickListener(
        new View.OnClickListener() {
          @Override
          public void onClick(View v) {
            if (!toggleOnClick) {
              listener.onClick(self);
              return;
            }

            checked = !checked;
            listener.onClick(self);

            if (checkBox != null) {
              checkBox.setChecked(checked);
              return;
            }

            if (radioButton != null) {
              uncheckOtherRadioButtons();
              radioButton.setChecked(checked);
              return;
            }
          }
        }
      );
  }

  private void uncheckOtherRadioButtons() {
    ViewGroup parent = (ViewGroup) this.getParent();
    if (!checked || parent == null) return;

    int childCount = parent.getChildCount();
    for (int i = 0; i < childCount; i++) {
      View child = parent.getChildAt(i);
      if (child instanceof MenuItem) {
        MenuItem menuItem = (MenuItem) child;
        if (menuItem.radioGroup == this.radioGroup) {
          menuItem.setChecked(false, false);
        }
      }
    }
  }
}

abstract class OnMenuClickListener {

  public abstract void onClick(MenuItem v);
}
