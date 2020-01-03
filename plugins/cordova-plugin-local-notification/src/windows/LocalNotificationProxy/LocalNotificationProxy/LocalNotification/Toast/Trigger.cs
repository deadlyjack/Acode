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

namespace LocalNotificationProxy.LocalNotification.Toast
{
    using Windows.Data.Xml.Dom;

    public sealed class Trigger
    {
        // private DateTime? triggerDate;

        /// <summary>
        /// Gets the trigger type.
        /// </summary>
        public string Type { get; } = "calendar";

        /// <summary>
        /// Gets or sets the fix trigger date.
        /// </summary>
        public long At { get; set; } = 0;

        /// <summary>
        /// Gets or sets the first trigger date.
        /// </summary>
        public long FirstAt { get; set; } = 0;

        /// <summary>
        /// Gets or sets the before trigger date.
        /// </summary>
        public long Before { get; set; } = 0;

        /// <summary>
        /// Gets or sets the after trigger date.
        /// </summary>
        public long After { get; set; } = 0;

        /// <summary>
        /// Gets or sets the relative trigger date from now.
        /// </summary>
        public int In { get; set; } = 0;

        /// <summary>
        /// Gets or sets the trigger count.
        /// </summary>
        public int Count { get; set; } = 1;

        /// <summary>
        /// Gets the trigger occurrence.
        /// </summary>
        public int Occurrence { get; internal set; } = 1;

        /// <summary>
        /// Gets or sets the trigger interval.
        /// </summary>
        public object Every { get; set; }

        /// <summary>
        /// Gets or sets the trigger unit.
        /// </summary>
        public string Unit { get; set; }

        /// <summary>
        /// Deserializes the XML string into an instance of Trigger.
        /// </summary>
        /// <param name="xml">The serialized instance of Options as an xml string.</param>
        /// <returns>An instance where all properties have been assigned.</returns>
        internal static Trigger Parse(string xml)
        {
            var doc = new XmlDocument();
            doc.LoadXml(xml);

            var trigger = new Trigger();
            var node = doc.DocumentElement;

            trigger.At = long.Parse(node.GetAttribute("at"));
            trigger.FirstAt = long.Parse(node.GetAttribute("firstAt"));
            trigger.Before = long.Parse(node.GetAttribute("before"));
            trigger.After = long.Parse(node.GetAttribute("after"));
            trigger.In = int.Parse(node.GetAttribute("in"));
            trigger.Count = int.Parse(node.GetAttribute("count"));
            trigger.Occurrence = int.Parse(node.GetAttribute("occurrence"));

            if (node.GetAttributeNode("unit") != null)
            {
                trigger.Unit = node.GetAttribute("unit");
            }

            if (node.GetAttributeNode("strEvery") != null)
            {
                trigger.Every = node.GetAttribute("strEvery");
            }
            else if (node.GetAttributeNode("hshEvery") != null)
            {
                trigger.Every = Toast.Every.Parse(node.GetAttribute("hshEvery"));
            }

            return trigger;
        }

        /// <summary>
        /// Gets the instance as an serialized xml element.
        /// </summary>
        /// <returns>Element with all property values set as attributes.</returns>
        internal string GetXml()
        {
            var node = new XmlDocument().CreateElement("trigger");

            node.SetAttribute("at", this.At.ToString());
            node.SetAttribute("firstAt", this.FirstAt.ToString());
            node.SetAttribute("before", this.Before.ToString());
            node.SetAttribute("after", this.After.ToString());
            node.SetAttribute("in", this.In.ToString());
            node.SetAttribute("count", this.Count.ToString());
            node.SetAttribute("occurrence", this.Occurrence.ToString());

            if (!string.IsNullOrEmpty(this.Unit))
            {
                node.SetAttribute("unit", this.Unit);
            }

            if (this.Every != null)
            {
                if (this.Every is Every)
                {
                    node.SetAttribute("hshEvery", (this.Every as Every).GetXml());
                }
                else
                {
                    node.SetAttribute("strEvery", this.Every.ToString());
                }
            }

            return node.GetXml();
        }
    }

}
