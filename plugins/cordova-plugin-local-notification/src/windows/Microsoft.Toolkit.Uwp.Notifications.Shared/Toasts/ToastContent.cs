// ******************************************************************
// Copyright (c) Microsoft. All rights reserved.
// This code is licensed under the MIT License (MIT).
// THE CODE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
// THE CODE OR THE USE OR OTHER DEALINGS IN THE CODE.
// ******************************************************************

using System;
#if WINDOWS_UWP
using Windows.Data.Xml.Dom;
using Windows.UI.Notifications;
#endif

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// Base Toast element, which contains at least a visual element.
    /// </summary>
    public sealed class ToastContent : INotificationContent
    {
        /// <summary>
        /// The visual element is required.
        /// </summary>
        public ToastVisual Visual { get; set; }

        /// <summary>
        /// Specify custom audio options.
        /// </summary>
        public ToastAudio Audio { get; set; }

        /// <summary>
        /// Optionally create custom actions with buttons and inputs (using <see cref="ToastActionsCustom"/>) or optionally use the system-default snooze/dismiss controls (with <see cref="ToastActionsSnoozeAndDismiss"/>).
        /// </summary>
        public IToastActions Actions { get; set; }

        /// <summary>
        /// New in Creators Update: Gets or sets an optional header for the toast notification.
        /// </summary>
        public ToastHeader Header { get; set; }

        /// <summary>
        /// Specify the scenario, to make the Toast behave like an alarm, reminder, or more.
        /// </summary>
        public ToastScenario Scenario { get; set; }

        /// <summary>
        /// The amount of time the Toast should display. You typically should use the Scenario attribute instead, which impacts how long a Toast stays on screen.
        /// </summary>
        public ToastDuration Duration { get; set; }

        /// <summary>
        /// A string that is passed to the application when it is activated by the Toast. The format and contents of this string are defined by the app for its own use. When the user taps or clicks the Toast to launch its associated app, the launch string provides the context to the app that allows it to show the user a view relevant to the Toast content, rather than launching in its default way.
        /// </summary>
        public string Launch { get; set; }

        /// <summary>
        /// Specifies what activation type will be used when the user clicks the body of this Toast.
        /// </summary>
        public ToastActivationType ActivationType { get; set; }

        /// <summary>
        /// New in Creators Update: Additional options relating to activation of the toast notification.
        /// </summary>
        public ToastActivationOptions ActivationOptions { get; set; }

        /// <summary>
        /// New in Creators Update: An optional custom time to use for the notification's timestamp, visible within Action Center. If provided, this date/time will be used on the notification instead of the date/time that the notification was received.
        /// </summary>
        public DateTimeOffset? DisplayTimestamp { get; set; }

        /// <summary>
        /// Retrieves the notification XML content as a string, so that it can be sent with a HTTP POST in a push notification.
        /// </summary>
        /// <returns>The notification XML content as a string.</returns>
        public string GetContent()
        {
            return ConvertToElement().GetContent();
        }

#if WINDOWS_UWP

        /// <summary>
        /// Retrieves the notification XML content as a WinRT XmlDocument, so that it can be used with a local Toast notification's constructor on either <see cref="ToastNotification"/> or <see cref="ScheduledToastNotification"/>.
        /// </summary>
        /// <returns>The notification XML content as a WinRT XmlDocument.</returns>
        public XmlDocument GetXml()
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(GetContent());

            return doc;
        }

#endif

        internal Element_Toast ConvertToElement()
        {
            if (ActivationOptions != null)
            {
                if (ActivationOptions.AfterActivationBehavior != ToastAfterActivationBehavior.Default)
                {
                    throw new InvalidOperationException("ToastContent does not support a custom AfterActivationBehavior. Please ensure ActivationOptions.AfterActivationBehavior is set to Default.");
                }
            }

            DateTimeOffset? strippedDisplayTimestamp = null;
            if (DisplayTimestamp != null)
            {
                // We need to make sure we don't include more than 3 decimal points on seconds
                // The Millisecond value itself is limited to 3 decimal points, thus by doing the following
                // we bypass the more granular value that can come from Ticks and ensure we only have 3 decimals at most.
                var val = DisplayTimestamp.Value;
                strippedDisplayTimestamp = new DateTimeOffset(val.Year, val.Month, val.Day, val.Hour, val.Minute, val.Second, val.Millisecond, val.Offset);
            }

            var toast = new Element_Toast()
            {
                ActivationType = Element_Toast.ConvertActivationType(ActivationType),
                Duration = Duration,
                Launch = Launch,
                Scenario = Scenario,
                DisplayTimestamp = strippedDisplayTimestamp
            };

            ActivationOptions?.PopulateElement(toast);

            if (Visual != null)
            {
                toast.Visual = Visual.ConvertToElement();
            }

            if (Audio != null)
            {
                toast.Audio = Audio.ConvertToElement();
            }

            if (Actions != null)
            {
                toast.Actions = ConvertToActionsElement(Actions);
            }

            if (Header != null)
            {
                toast.Header = Header.ConvertToElement();
            }

            return toast;
        }

        private static Element_ToastActions ConvertToActionsElement(IToastActions actions)
        {
            if (actions is ToastActionsCustom)
            {
                return (actions as ToastActionsCustom).ConvertToElement();
            }

            if (actions is ToastActionsSnoozeAndDismiss)
            {
                return (actions as ToastActionsSnoozeAndDismiss).ConvertToElement();
            }

            throw new NotImplementedException("Unknown actions type: " + actions.GetType());
        }
    }
}