package com.foxdebug.system;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.util.Log;
import android.util.TypedValue;
import org.json.JSONObject;

public class Ui {

  public static class Icons {

    static final String LOGO = "\uE922";
    static final String TUNE = "\uE927";
    static final String EXIT = "\uE902";
    static final String REFRESH = "\uE91B";
    static final String TERMINAL = "\uE923";
    static final String NO_CACHE = "\uE901";
    static final String MORE_VERT = "\uE91A";
    static final String OPEN_IN_BROWSER = "\uE91f";

    static final String PHONE_APPLE = "\uE90D";
    static final String PHONE_ANDROID = "\uE90E";
    static final String TABLET_ANDROID = "\uE90F";
    static final String TABLET_APPLE = "\uE92A";
    static final String DESKTOP = "\uE90A";
    static final String DEVICES = "\uE907";
    static final String LAPTOP = "\uE90D";
    static final String TV = "\uE929";

    private static final String FONT_PATH = "font/icon.ttf";

    private static int size = 24;
    private static int color = Color.parseColor("#000000");
    private static Paint paint;

    public static Bitmap get(
      Context context,
      String code,
      int size,
      int color
    ) {
      if (paint == null) {
        paint = new Paint();
        paint.setAntiAlias(true);
        paint.setTypeface(
          Typeface.createFromAsset(context.getAssets(), FONT_PATH)
        );
        paint.setTextAlign(Paint.Align.CENTER);
      }

      paint.setTextSize(size);
      paint.setColor(color);

      float baseline = -paint.ascent();
      int width = (int) paint.measureText(code, 0, code.length());
      int height = (int) (baseline + paint.descent());
      Bitmap bitmap = Bitmap.createBitmap(
        width,
        height,
        Bitmap.Config.ARGB_8888
      );
      Canvas canvas = new Canvas(bitmap);

      canvas.drawText(code, width / 2, baseline, paint);
      return bitmap;
    }

    public static Bitmap get(
      Context context,
      String code,
      int size,
      String color
    ) {
      int intColor = Color.parseColor(color);
      return get(context, code, size, intColor);
    }

    public static Bitmap get(Context context, String code) {
      return get(context, code, size, color);
    }

    public static Bitmap get(Context context, String code, int size) {
      return get(context, code, size, color);
    }

    public static Bitmap get(Context context, String code, String color) {
      int intColor = Color.parseColor(color);
      return get(context, code, size, intColor);
    }

    public static void setSize(int size) {
      Icons.size = size;
    }

    public static void setColor(int color) {
      Icons.color = color;
    }
  }

  public static class Theme {

    private JSONObject theme;

    public Theme(JSONObject theme) {
      this.theme = theme;
    }

    public int get(String color) {
      return get(color, "#000000");
    }

    public int get(String color, String fallback) {
      String hex = theme.optString(color, fallback);
      return Color.parseColor(hex);
    }

    public String getType() {
      return theme.optString("type", "light");
    }
  }

  public static int dpToPixels(Context context, int dipValue) {
    int value = (int) TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      (float) dipValue,
      context.getResources().getDisplayMetrics()
    );

    return value;
  }
}
