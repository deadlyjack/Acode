package com.foxdebug.browser;

import android.content.Context;
import android.graphics.Typeface;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;
import com.foxdebug.system.Ui;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;

public class Emulator extends LinearLayout {

  private Ui.Theme theme;
  private View reference;
  private Context context;
  private Callback listener;
  private boolean initialized = false;
  private Device defaultDevice;
  private LinearLayout seekBarsLayout;
  private DeviceListView deviceListView;
  private boolean preventChangeDevice = false;
  private HashMap<String, SeekBar> seekBars = new HashMap<String, SeekBar>();

  public abstract static class Callback {

    public abstract void onChange(int width, int height);
  }

  public Emulator(Context context, Ui.Theme theme) {
    super(context);
    this.context = context;
    this.theme = theme;

    defaultDevice = new Device("Custom", 0, 0, Ui.Icons.TUNE, false);
    deviceListView = new DeviceListView(context, theme);
    deviceListView.setLayoutParams(
      new LinearLayout.LayoutParams(
        Ui.dpToPixels(context, 100),
        LinearLayout.LayoutParams.MATCH_PARENT
      )
    );

    deviceListView.setOnSelect(
      new DeviceListView.Callback() {
        @Override
        public void onSelect(Device device) {
          selectDevice(device);
        }
      }
    );

    deviceListView.add(
      defaultDevice,
      new Device("iPhone SE", 320, 568, Ui.Icons.PHONE_APPLE),
      new Device("iPhone 8", 375, 667, Ui.Icons.PHONE_APPLE),
      new Device("iPhone 8+", 414, 736, Ui.Icons.PHONE_APPLE),
      new Device("iPhone X", 375, 812, Ui.Icons.PHONE_APPLE),
      new Device("iPad", 768, 1024, Ui.Icons.TABLET_APPLE),
      new Device("iPad Pro", 1024, 1366, Ui.Icons.TABLET_APPLE),
      new Device("Galaxy S5", 360, 640, Ui.Icons.PHONE_ANDROID),
      new Device("Pixel 2", 411, 731, Ui.Icons.PHONE_ANDROID),
      new Device("Pixel 2 XL", 411, 823, Ui.Icons.PHONE_ANDROID),
      new Device("Nexus 5X", 411, 731, Ui.Icons.PHONE_ANDROID),
      new Device("Nexus 6P", 411, 731, Ui.Icons.PHONE_ANDROID),
      new Device("Nexus 7", 600, 960, Ui.Icons.TABLET_ANDROID),
      new Device("Nexus 10", 800, 1280, Ui.Icons.TABLET_ANDROID),
      new Device("Laptop", 1280, 800, Ui.Icons.LAPTOP),
      new Device("Laptop L", 1440, 900, Ui.Icons.LAPTOP),
      new Device("Laptop XL", 1680, 1050, Ui.Icons.LAPTOP),
      new Device("UHD 4k", 3840, 2160, Ui.Icons.TV)
    );

    deviceListView.select(defaultDevice);

    seekBarsLayout = new LinearLayout(context);
    seekBarsLayout.setPadding(0, 10, 0, 0);
    seekBarsLayout.setOrientation(LinearLayout.VERTICAL);
    seekBarsLayout.setLayoutParams(
      new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT,
        1
      )
    );

    addControl("width", 50, "Width");
    addControl("height", 50, "Height");
    setOrientation(LinearLayout.HORIZONTAL);
    setBackgroundColor(theme.get("primaryColor"));
    setLayoutParams(
      new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )
    );

    addView(seekBarsLayout);
    addView(deviceListView);
  }

  public void setChangeListener(Callback listener) {
    this.listener = listener;
  }

  public void setReference(View view) {
    SeekBar widthSeekBar = seekBars.get("width");
    SeekBar heightSeekBar = seekBars.get("height");
    int maxWidth = view.getMeasuredWidth();
    int maxHeight = view.getMeasuredHeight();
    int width = widthSeekBar.getProgress();
    int height = heightSeekBar.getProgress();
    int minWidth = widthSeekBar.getMin();
    int minHeight = heightSeekBar.getMin();

    getViewTreeObserver()
      .addOnGlobalLayoutListener(
        new ViewTreeObserver.OnGlobalLayoutListener() {
          @Override
          public void onGlobalLayout() {
            Log.d("Emulator", "onGlobalLayout");
            getViewTreeObserver().removeOnGlobalLayoutListener(this);
            int correctedHeight = maxHeight - getHeight();

            widthSeekBar.setMax(maxWidth);
            heightSeekBar.setMax(correctedHeight);

            preventChangeDevice = true;
            if (width > maxWidth || !initialized) {
              heightSeekBar.setProgress(maxHeight);
            }

            if (height > correctedHeight || !initialized) {
              widthSeekBar.setProgress(maxWidth);
            }
            preventChangeDevice = false;
          }
        }
      );
  }

  public int getWidthProgress() {
    return seekBars.get("width").getProgress();
  }

  public int getHeightProgress() {
    return seekBars.get("height").getProgress();
  }

  private void addControl(String id, int height, String label) {
    LinearLayout linearLayout = new LinearLayout(context);
    TextView textView = new TextView(context);
    SeekBar seekBar = new SeekBar(context);

    linearLayout.setOrientation(LinearLayout.VERTICAL);
    linearLayout.setLayoutParams(
      new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )
    );

    seekBar.setMin(300);
    seekBar.setLayoutParams(
      new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        height,
        1
      )
    );

    textView.setText(String.format(label, 0));
    textView.setPadding(10, 0, 0, 0);

    linearLayout.addView(textView);
    linearLayout.addView(seekBar);
    seekBarsLayout.addView(linearLayout);
    seekBars.put(id, seekBar);

    seekBar.setOnSeekBarChangeListener(
      new SeekBar.OnSeekBarChangeListener() {
        @Override
        public void onProgressChanged(
          SeekBar seekBar,
          int progress,
          boolean fromUser
        ) {
          if (listener != null) {
            listener.onChange(getWidthProgress(), getHeightProgress());
          }
          if (!preventChangeDevice) {
            selectDevice(defaultDevice);
          }
        }

        @Override
        public void onStartTrackingTouch(SeekBar seekBar) {}

        @Override
        public void onStopTrackingTouch(SeekBar seekBar) {}
      }
    );
  }

  private void selectDevice(Device device) {
    if (device.id == defaultDevice.id) {
      return;
    }

    SeekBar widthSeekBar = seekBars.get("width");
    SeekBar heightSeekBar = seekBars.get("height");
    int maxWidth = widthSeekBar.getMax();
    int maxHeight = heightSeekBar.getMax();

    int width = device.width;
    int height = device.height;

    if (width > maxWidth) {
      float ratio = (width - maxWidth) / (float) width;
      width = maxWidth;
      height = (int) (height - (height * ratio));
    }

    if (height > maxHeight) {
      float ratio = (height - maxHeight) / (float) height;
      height = maxHeight;
      width = (int) (width - (width * ratio));
    }

    preventChangeDevice = true;
    widthSeekBar.setProgress(width);
    heightSeekBar.setProgress(height);
    preventChangeDevice = false;
  }
}

class Device {

  public int id;
  public int width;
  public int height;
  public String name;
  public String icon;
  public boolean isDesktop;

  public Device(
    String name,
    int width,
    int height,
    String icon,
    boolean isDesktop
  ) {
    this.id = View.generateViewId();
    this.name = name;
    this.icon = icon;
    this.width = width;
    this.height = height;
    this.isDesktop = isDesktop;
  }

  public Device(String name, int width, int height, String icon) {
    this(name, width, height, icon, true);
  }

  public Device(String name, int width, int height) {
    this(name, width, height, Ui.Icons.TUNE, true);
  }
}

class DeviceListView extends ScrollView {

  DeviceView selectedDeviceView;
  LinearLayout deviceListLayout;
  Callback callback;
  Context context;
  Ui.Theme theme;

  public abstract static class Callback {

    public abstract void onSelect(Device device);
  }

  public DeviceListView(Context context, Ui.Theme theme) {
    super(context);
    this.context = context;
    this.theme = theme;

    deviceListLayout = new LinearLayout(context);
    deviceListLayout.setOrientation(LinearLayout.VERTICAL);
    deviceListLayout.setLayoutParams(
      new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )
    );

    addView(deviceListLayout);
  }

  public void add(Device... devices) {
    for (Device device : devices) {
      add(device);
    }
  }

  public void select(Device device) {
    DeviceView deviceView = (DeviceView) findViewById(device.id);
    deviceView.select();
    selectedDeviceView = deviceView;
  }

  public void add(Device device) {
    DeviceView deviceView = new DeviceView(context, device, theme);
    deviceListLayout.addView(deviceView);

    deviceView.setOnSelect(
      new DeviceView.Callback() {
        @Override
        public void onSelect(DeviceView view) {
          if (callback == null) return;

          if (selectedDeviceView != null) selectedDeviceView.deselect();
          view.select();

          callback.onSelect(view.device);
          selectedDeviceView = view;
        }
      }
    );
  }

  public void setOnSelect(Callback callback) {
    this.callback = callback;
  }
}

class DeviceView extends LinearLayout {

  Ui.Theme theme;
  Device device;
  TextView label;
  ImageView icon;
  Context context;
  boolean isSelected = false;

  public abstract static class Callback {

    public abstract void onSelect(DeviceView device);
  }

  public DeviceView(Context context, Device device, Ui.Theme theme) {
    super(context);
    int primaryTextColor = theme.get("primaryTextColor");
    this.theme = theme;
    this.device = device;
    this.context = context;

    setId(device.id);
    setClickable(true);
    setPadding(0, 5, 0, 5);
    setOrientation(LinearLayout.HORIZONTAL);

    icon = new ImageView(context);
    icon.setImageBitmap(Ui.Icons.get(context, device.icon, primaryTextColor));
    icon.setPadding(0, 0, 5, 0);
    icon.setLayoutParams(
      new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.WRAP_CONTENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )
    );

    label = new TextView(context);
    label.setSingleLine(true);
    label.setText(device.name);
    label.setTextColor(primaryTextColor);

    addView(icon);
    addView(label);
  }

  public void setOnSelect(Callback callback) {
    DeviceView self = this;
    setOnClickListener(
      new View.OnClickListener() {
        @Override
        public void onClick(View view) {
          callback.onSelect(self);
        }
      }
    );
  }

  public void deselect() {
    int primaryTextColor = theme.get("primaryTextColor");
    icon.setImageBitmap(Ui.Icons.get(context, device.icon, primaryTextColor));
    label.setTextColor(primaryTextColor);
    label.setTypeface(null, Typeface.NORMAL);
    isSelected = false;
  }

  public void select() {
    int activeTextColor = theme.get("activeTextColor");
    icon.setImageBitmap(Ui.Icons.get(context, device.icon, activeTextColor));
    label.setTextColor(activeTextColor);
    label.setTypeface(null, Typeface.BOLD);
    isSelected = true;
  }
}
