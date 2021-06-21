using System;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Phone.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Media;

namespace WPCordovaClassLib.Cordova.Commands
{
    public class Toast : BaseCommand
    {

        Popup popup;

        private PhoneApplicationPage Page
        {
            get
            {
                PhoneApplicationPage page = null;
                PhoneApplicationFrame frame = Application.Current.RootVisual as PhoneApplicationFrame;
                if (frame != null)
                {
                    page = frame.Content as PhoneApplicationPage;
                }
                return page;
            }
        }

        [DataContract]
        public class ToastOptions
        {
            [DataMember(IsRequired = true, Name = "message")]
            public string message { get; set; }

            [DataMember(IsRequired = true, Name = "duration")]
            public string duration { get; set; }

            [DataMember(IsRequired = true, Name = "position")]
            public string position { get; set; }

            [DataMember(IsRequired = false, Name = "addPixelsY")]
            public int addPixelsY { get; set; }
        }

        public void show(string options)
        {
            ToastOptions toastOptions;
            string[] args = JSON.JsonHelper.Deserialize<string[]>(options);
            String jsonOptions = args[0];

            try
            {
                toastOptions = JSON.JsonHelper.Deserialize<ToastOptions>(jsonOptions);
            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                return;
            }

            var message = toastOptions.message;
            var duration = toastOptions.duration;
            var position = toastOptions.position;
            int addPixelsY = toastOptions.addPixelsY;

            string aliasCurrentCommandCallbackId = args[1];

            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                PhoneApplicationPage page = Page;
                if (page != null)
                {
                    Grid grid = page.FindName("LayoutRoot") as Grid;
                    if (grid != null)
                    {
                        TextBlock tb = new TextBlock();
                        tb.TextWrapping = TextWrapping.Wrap;
                        tb.TextAlignment = TextAlignment.Center;
                        tb.Text = message;
                        tb.Foreground = new SolidColorBrush(Color.FromArgb(255,255,255,255)); // white

                        Border b = new Border();
                        b.CornerRadius = new CornerRadius(12);
                        b.Background = new SolidColorBrush(Color.FromArgb(190, 55, 55, 55));
                        b.HorizontalAlignment = HorizontalAlignment.Center;
                        
                        Grid pgrid = new Grid();
                        pgrid.HorizontalAlignment = HorizontalAlignment.Stretch;
                        pgrid.VerticalAlignment = VerticalAlignment.Stretch;
                        pgrid.Margin = new Thickness(20);
                        pgrid.Children.Add(tb);
                        pgrid.Width = Application.Current.Host.Content.ActualWidth - 80;

                        b.Child = pgrid;
                        if (popup != null && popup.IsOpen)
                        {
                            popup.IsOpen = false;
                        }
                        popup = new Popup();
                        popup.Child = b;
  
                        popup.HorizontalOffset = 20;
                        popup.Width = Application.Current.Host.Content.ActualWidth;
                        popup.HorizontalAlignment = HorizontalAlignment.Center;

                        if ("top".Equals(position))
                        {
                            popup.VerticalAlignment = VerticalAlignment.Top;
                            popup.VerticalOffset = 20 + addPixelsY;
                        }
                        else if ("bottom".Equals(position))
                        {
                            popup.VerticalAlignment = VerticalAlignment.Bottom;
                            popup.VerticalOffset = -100 + addPixelsY; // TODO can do better
                        }
                        else if ("center".Equals(position))
                        {
                            popup.VerticalAlignment = VerticalAlignment.Center;
                            popup.VerticalOffset = -50 + addPixelsY; // TODO can do way better
                        }
                        else
                        {
                            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "invalid position. valid options are 'top', 'center' and 'bottom'"));
                            return;
                        }

                        int hideDelay = 2500;
                        if ("long".Equals(duration))
                        {
                            hideDelay = 5000;
                        }
                        else if (!"short".Equals(duration))
                        {
                            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "invalid duration. valid options are 'short' and 'long'"));
                            return;
                        }

                        grid.Children.Add(popup);
                        popup.IsOpen = true;
                        this.hidePopup(hideDelay);
                    }
                }
                else
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.INSTANTIATION_EXCEPTION));
                }
            });
        }

        public void hide(string options)
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                if (popup != null && popup.IsOpen)
                {
                    popup.IsOpen = false;
                }
            });
        }

        private async void hidePopup(int delay)
        {
            await Task.Delay(delay);
            popup.IsOpen = false;
        }
    }
}
