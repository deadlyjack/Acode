/*
 * Apache 2.0 License
 *
 * Copyright (c) Sebastian Katzer 2017
 *
 * This file contains Original Code and/or Modifications of Original Code
 * as defined in and that are subject to the Apache License
 * Version 2.0 (the 'License'). You may not use this file except in
 * compliance with the License. Please obtain a copy of the License at
 * http://opensource.org/licenses/Apache-2.0/ and read it before using this
 * file.
 *
 * The Original Code and all software distributed under the License are
 * distributed on an 'AS IS' basis, WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, AND APPLE HEREBY DISCLAIMS ALL SUCH WARRANTIES,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT.
 * Please see the License for the specific language governing rights and
 * limitations under the License.
 */

namespace LocalNotificationProxy.LocalNotification
{
    using Microsoft.Toolkit.Uwp.Notifications;
    using Windows.UI.Notifications;

    internal class Builder
    {
        /// <summary>
        /// The provided trigger request.
        /// </summary>
        private readonly Request request;

        /// <summary>
        /// Initializes a new instance of the <see cref="Builder"/> class.
        /// </summary>
        /// <param name="request">Trigger request.</param>
        public Builder(Request request)
        {
            this.request = request;
            this.Content = new Notification(request.Options);
        }

        /// <summary>
        /// Gets the content.
        /// </summary>
        public Notification Content { get; private set; }

        /// <summary>
        /// Gets the options.
        /// </summary>
        private Options Options { get => this.Content.Options; }

        /// <summary>
        /// Build a toast notification specified by the options.
        /// </summary>
        /// <returns>A fully configured toast notification instance.</returns>
        public ScheduledToastNotification Build()
        {
            var toast = this.InitToast();

            this.AddProgressBarToToast(toast);
            this.AddAttachmentsToToast(toast);
            this.AddActionsToToast(toast);

            return this.ConvertToastToNotification(toast);
        }

        /// <summary>
        /// Gets the initialize skeleton for a toast notification.
        /// </summary>
        /// <returns>Basic skeleton with sound, image and text.</returns>
        private ToastContent InitToast()
        {
            return new ToastContent()
            {
                Launch = this.Content.GetXml(),
                Audio = this.Content.Sound,

                Visual = new ToastVisual()
                {
                    BindingGeneric = new ToastBindingGeneric()
                    {
                        Children =
                        {
                            new AdaptiveText()
                            {
                                Text = this.Options.Title
                            },

                            new AdaptiveText()
                            {
                                Text = this.Options.Text
                            }
                        },

                        AppLogoOverride = this.Content.Icon
                    }
                },

                Actions = new ToastActionsCustom()
                {
                    Buttons = { },
                    Inputs = { }
                }
            };
        }

        /// <summary>
        /// Adds optional progress bar to the toast.
        /// </summary>
        /// <param name="toast">Tho toast to extend for.</param>
        private void AddProgressBarToToast(ToastContent toast)
        {
            var progressBar = this.Content.ProgressBar;

            if (progressBar != null)
            {
                toast.Visual.BindingGeneric.Children.Add(progressBar);
            }
        }

        /// <summary>
        /// Adds attachments to the toast.
        /// </summary>
        /// <param name="toast">Tho toast to extend for.</param>
        private void AddAttachmentsToToast(ToastContent toast)
        {
            foreach (var image in this.Content.Attachments)
            {
                toast.Visual.BindingGeneric.Children.Add(image);
            }
        }

        /// <summary>
        /// Adds buttons and input fields to the toast.
        /// </summary>
        /// <param name="toast">Tho toast to extend for.</param>
        private void AddActionsToToast(ToastContent toast)
        {
            foreach (var btn in this.Content.Inputs)
            {
                (toast.Actions as ToastActionsCustom).Inputs.Add(btn);
            }

            foreach (var btn in this.Content.Buttons)
            {
                (toast.Actions as ToastActionsCustom).Buttons.Add(btn);
            }
        }

        /// <summary>
        /// Converts the toast into a notification.
        /// </summary>
        /// <param name="toast">The toast to convert.</param>
        /// <returns>A notification ready to schedule.</returns>
        private ScheduledToastNotification ConvertToastToNotification(ToastContent toast)
        {
            var xml = toast.GetXml();
            var at = this.request.TriggerDate;
            ScheduledToastNotification notification;

            if (!at.HasValue)
            {
                return null;
            }

            try
            {
                notification = new ScheduledToastNotification(xml, at.Value);
            }
            catch
            {
                return null;
            }

            notification.Id = this.Content.Id;
            notification.Tag = this.Options.Id.ToString();
            notification.SuppressPopup = this.Options.Silent;

            if (this.request.Occurrence > 2)
            {
                notification.Group = notification.Tag;
            }

            return notification;
        }
    }
}
