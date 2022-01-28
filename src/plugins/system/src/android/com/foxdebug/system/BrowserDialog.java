package com.foxdebug.system;

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
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.foxdebug.system.Base64Icons;

public class BrowserDialog extends Dialog {

  Context context;
  WebView webView;
  TextView titleText;
  ImageView icon;
  boolean desktopMode = false;
  boolean consoleEnabled = false;
  boolean showButtons = true;
  String url;
  String themeType = "light";
  int backgroundColor = 0xFF000000;
  int textColor = 0xFFFFFFFF;
  Bitmap browserIcon;
  TextView urlText;

  public BrowserDialog(Context context, int theme) {
    super(context, theme);
    this.context = context;
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
      urlText.setText(url);
    } else {
      dismiss();
    }
  }

  public void init() {
    this.requestWindowFeature(Window.FEATURE_NO_TITLE);
    this.setCancelable(true);

    browserIcon =
      convertBase64ToBitmap(
        themeType.equals("light")
          ? Base64Icons.BROWSER_DARK
          : Base64Icons.BROWSER
      );

    SwipeRefreshLayout swipeRefreshLayout = new SwipeRefreshLayout(context);
    swipeRefreshLayout.setLayoutParams(
      new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    );
    swipeRefreshLayout.setOnRefreshListener(
      new SwipeRefreshLayout.OnRefreshListener() {
        @Override
        public void onRefresh() {
          webView.reload();
        }
      }
    );

    //main
    LinearLayout main = new LinearLayout(context);
    main.setOrientation(LinearLayout.VERTICAL);

    //title
    LinearLayout title = new LinearLayout(context);
    title.setOrientation(LinearLayout.HORIZONTAL);
    title.setBackgroundColor(backgroundColor);
    title.setLayoutParams(
      new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 120)
    );
    title.setHorizontalGravity(Gravity.LEFT);
    title.setVerticalGravity(Gravity.TOP);

    //icon
    icon = new ImageView(context);
    icon.setLayoutParams(new LinearLayout.LayoutParams(120, 120, 0));
    icon.setPadding(30, 30, 30, 30);
    icon.setImageBitmap(browserIcon);

    //title heading
    LinearLayout titleHeading = new LinearLayout(context);
    titleHeading.setOrientation(LinearLayout.VERTICAL);
    titleHeading.setLayoutParams(
      new LinearLayout.LayoutParams(
        LayoutParams.FILL_PARENT,
        LayoutParams.MATCH_PARENT,
        1
      )
    );

    //title text
    titleText = createTextView("Browser", 14);

    //url text
    urlText = createTextView("", 10);

    titleHeading.addView(titleText);
    if (showButtons) titleHeading.addView(urlText);

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
          Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
          context.startActivity(browserIntent);
        }
      }
    );

    title.addView(icon);
    title.addView(titleHeading);
    if (showButtons) {
      title.addView(toggleDesktopModeButton);
      title.addView(openInBrowserButton);
    }

    //webview
    webView = new WebView(context);
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
          titleText.setText(title);
        }

        @Override
        public void onReceivedIcon(WebView view, Bitmap favicon) {
          super.onReceivedIcon(view, favicon);
          icon.setImageBitmap(favicon);
        }
      }
    );
    webView.setWebViewClient(
      new WebViewClient() {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
          setUrl(url);
          icon.setImageBitmap(browserIcon);
          return false;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
          super.onPageStarted(view, url, favicon);
          swipeRefreshLayout.setRefreshing(true);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
          super.onPageFinished(view, url);
          swipeRefreshLayout.setRefreshing(false);
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
                title.post(
                  new Runnable() {
                    @Override
                    public void run() {
                      if (!value.equals("null")) {
                        if (
                          toggleConsoleButton.getParent() == null
                        ) title.addView(toggleConsoleButton);
                        return;
                      }

                      title.removeView(toggleConsoleButton);
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

    swipeRefreshLayout.addView(webView);
    main.addView(title);
    main.addView(swipeRefreshLayout);
    setContentView(main);
  }

  private TextView createTextView(String text, int fontSize) {
    TextView textView = new TextView(context);
    textView.setEllipsize(TruncateAt.END);
    textView.setSingleLine(true);
    textView.setHorizontallyScrolling(true);
    textView.setText(text);
    textView.setTextColor(textColor);
    textView.setTextSize(fontSize);
    textView.setGravity(Gravity.CENTER_VERTICAL);
    textView.setLayoutParams(
      new LinearLayout.LayoutParams(
        LayoutParams.FILL_PARENT,
        LayoutParams.MATCH_PARENT,
        1
      )
    );
    return textView;
  }

  public void setTheme(int bgColor, String type) {
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

      // 0x80000000 FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS
      // 0x00000010 SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR

      if (themeType.equals("light")) {
        decorView.setSystemUiVisibility(uiOptions | 0x80000000 | 0x00000010);
        return;
      }
    }
  }

  public void setShowButtons(boolean show) {
    showButtons = show;
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
    urlText.setText(url);
    webView.loadUrl(url);
  }

  public void setTitle(String title) {
    titleText.setText(title);
  }

  @Override
  public void dismiss() {
    super.dismiss();
    webView.destroy();
  }

  public void show(String url, String title) {
    init();
    setUrl(url);
    setTitle(title);
    super.show();
  }

  private ImageButton createIcon(String icon, String contentDescription) {
    ImageButton button = new ImageButton(context);
    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
      100,
      100,
      0
    );
    params.gravity = Gravity.CENTER_VERTICAL;
    params.setMargins(0, 0, 10, 0);
    button.setBackgroundDrawable(null);
    button.setImageBitmap(convertBase64ToBitmap(icon));
    button.setContentDescription(contentDescription);
    button.setLayoutParams(params);
    button.setMaxHeight(24);
    button.setMaxWidth(24);
    button.setAdjustViewBounds(true);
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
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN) {
      view.setBackgroundDrawable(active ? border : null);
    } else {
      view.setBackground(active ? border : null);
    }
  }
}
