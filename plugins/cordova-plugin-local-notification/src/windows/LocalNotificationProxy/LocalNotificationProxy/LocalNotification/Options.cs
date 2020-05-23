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
    using global::LocalNotificationProxy.LocalNotification.Toast;
    using Windows.Data.Xml.Dom;

    public sealed class Options
    {
        /// <summary>
        /// Gets notification event.
        /// </summary>
        public string Action { get; private set; } = "click";

        /// <summary>
        /// Gets or sets notification ID.
        /// </summary>
        public int Id { get; set; } = 0;

        /// <summary>
        /// Gets or sets notification title.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets notification text.
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Gets or sets app badge number.
        /// </summary>
        public int Badge { get; set; }

        /// <summary>
        /// Gets or sets the notification sound.
        /// </summary>
        public string Sound { get; set; }

        /// <summary>
        /// Gets or sets the notification image.
        /// </summary>
        public string Icon { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the popup shall be visible.
        /// </summary>
        public bool Silent { get; set; } = false;

        /// <summary>
        /// Gets or sets the notification trigger.
        /// </summary>
        public Toast.Trigger Trigger { get; set; }

        /// <summary>
        /// Gets or sets the notification user data.
        /// </summary>
        public string Data { get; set; }

        /// <summary>
        /// Gets or sets the notification attachments.
        /// </summary>
        public string[] Attachments { get; set; }

        /// <summary>
        /// Gets or sets the notification actions.
        /// </summary>
        public IAction[] Actions { get; set; }

        /// <summary>
        /// Gets or sets the notification progress bar.
        /// </summary>
        public ProgressBar ProgressBar { get; set; }

        /// <summary>
        /// Deserializes the XML string into an instance of Options.
        /// </summary>
        /// <param name="identifier">The serialized instance of Options as an xml string.</param>
        /// <returns>An instance where all properties have been assigned.</returns>
        public static Options Parse(string identifier)
        {
            var doc = new XmlDocument();
            doc.LoadXml(identifier);

            var options = new Options();
            var node = doc.DocumentElement;

            options.Id = int.Parse(node.GetAttribute("id"));
            options.Badge = int.Parse(node.GetAttribute("badge"));
            options.Trigger = Toast.Trigger.Parse(node.GetAttribute("trigger"));

            if (node.GetAttributeNode("text") != null)
            {
                options.Text = node.GetAttribute("text");
            }

            if (node.GetAttributeNode("title") != null)
            {
                options.Title = node.GetAttribute("title");
            }

            if (node.GetAttributeNode("sound") != null)
            {
                options.Sound = node.GetAttribute("sound");
            }

            if (node.GetAttributeNode("image") != null)
            {
                options.Icon = node.GetAttribute("image");
            }

            if (node.GetAttributeNode("data") != null)
            {
                options.Data = node.GetAttribute("data");
            }

            if (node.GetAttributeNode("attachments") != null)
            {
                options.Attachments = node.GetAttribute("attachments").Split(',');
            }

            if (node.GetAttributeNode("silent") != null)
            {
                options.Silent = true;
            }

            if (node.GetAttributeNode("action") != null)
            {
                options.Action = node.GetAttribute("action");
            }

            return options;
        }

        /// <summary>
        /// Gets the instance as an serialized xml element.
        /// </summary>
        /// <returns>Element with all property values set as attributes.</returns>
        public string GetXml()
        {
            return this.GetXml(null);
        }

        /// <summary>
        /// Gets the instance as an serialized xml element.
        /// </summary>
        /// <param name="action">Optional (internal) event name.</param>
        /// <returns>Element with all property values set as attributes.</returns>
        internal string GetXml(string action)
        {
            var node = new XmlDocument().CreateElement("options");

            node.SetAttribute("id", this.Id.ToString());
            node.SetAttribute("badge", this.Badge.ToString());
            node.SetAttribute("trigger", this.Trigger.GetXml());

            if (this.Title != null)
            {
                node.SetAttribute("title", this.Title);
            }

            if (this.Text != null)
            {
                node.SetAttribute("text", this.Text);
            }

            if (this.Sound != null)
            {
                node.SetAttribute("sound", this.Sound);
            }

            if (this.Icon != null)
            {
                node.SetAttribute("image", this.Icon);
            }

            if (this.Data != null)
            {
                node.SetAttribute("data", this.Data);
            }

            if (this.Attachments != null)
            {
                node.SetAttribute("attachments", string.Join(",", this.Attachments));
            }

            if (this.Silent)
            {
                node.SetAttribute("silent", "1");
            }

            if (action != null)
            {
                node.SetAttribute("action", action);
            }

            return node.GetXml();
        }
    }
}