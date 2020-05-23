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
    using System;
    using Windows.Data.Xml.Dom;

    public sealed class Every
    {
        /// <summary>
        /// Gets or sets the minute.
        /// </summary>
        public int? Minute { get; set; }

        /// <summary>
        /// Gets or sets the hour.
        /// </summary>
        public int? Hour { get; set; }

        /// <summary>
        /// Gets or sets the day.
        /// </summary>
        public int? Day { get; set; }

        /// <summary>
        /// Gets or sets the day of week.
        /// </summary>
        public int? Weekday { get; set; }

        /// <summary>
        /// Gets or sets the week of year.
        /// </summary>
        public int? Week { get; set; }

        /// <summary>
        /// Gets or sets the day of ordinal week.
        /// </summary>
        public int? WeekdayOrdinal { get; set; }

        /// <summary>
        /// Gets or sets the week of month.
        /// </summary>
        public int? WeekOfMonth { get; set; }

        /// <summary>
        /// Gets or sets the month.
        /// </summary>
        public int? Month { get; set; }

        /// <summary>
        /// Gets or sets the quarter.
        /// </summary>
        public int? Quarter { get; set; }

        /// <summary>
        /// Gets or sets the year.
        /// </summary>
        public int? Year { get; set; }

        /// <summary>
        /// Deserializes the XML string into an instance of Every.
        /// </summary>
        /// <param name="xml">The serialized instance of Options as an xml string.</param>
        /// <returns>An instance where all properties have been assigned.</returns>
        internal static Every Parse(string xml)
        {
            var doc = new XmlDocument();
            doc.LoadXml(xml);

            var every = new Every();
            var node = doc.DocumentElement;

            if (node.GetAttributeNode("minute") != null)
            {
                every.Minute = Convert.ToInt32(node.GetAttribute("minute"));
            }

            if (node.GetAttributeNode("hour") != null)
            {
                every.Hour = Convert.ToInt32(node.GetAttribute("hour"));
            }

            if (node.GetAttributeNode("day") != null)
            {
                every.Day = Convert.ToInt32(node.GetAttribute("day"));
            }

            if (node.GetAttributeNode("weekday") != null)
            {
                every.Weekday = Convert.ToInt32(node.GetAttribute("weekday"));
            }

            if (node.GetAttributeNode("week") != null)
            {
                every.Week = Convert.ToInt32(node.GetAttribute("week"));
            }

            if (node.GetAttributeNode("weekdayordinal") != null)
            {
                every.WeekdayOrdinal = Convert.ToInt32(node.GetAttribute("weekdayOrdinal"));
            }

            if (node.GetAttributeNode("weekOfMonth") != null)
            {
                every.WeekOfMonth = Convert.ToInt32(node.GetAttribute("weekOfMonth"));
            }

            if (node.GetAttributeNode("month") != null)
            {
                every.Month = Convert.ToInt32(node.GetAttribute("month"));
            }

            if (node.GetAttributeNode("year") != null)
            {
                every.Year = Convert.ToInt32(node.GetAttribute("year"));
            }

            return every;
        }

        /// <summary>
        /// Gets the instance as an serialized xml element.
        /// </summary>
        /// <returns>Element with all property values set as attributes.</returns>
        internal string GetXml()
        {
            var node = new XmlDocument().CreateElement("every");

            if (this.Minute.HasValue)
            {
                node.SetAttribute("minute", this.Minute.ToString());
            }

            if (this.Hour.HasValue)
            {
                node.SetAttribute("hour", this.Hour.ToString());
            }

            if (this.Day.HasValue)
            {
                node.SetAttribute("day", this.Day.ToString());
            }

            if (this.Weekday.HasValue)
            {
                node.SetAttribute("weekday", this.Weekday.ToString());
            }

            if (this.Week.HasValue)
            {
                node.SetAttribute("week", this.Week.ToString());
            }

            if (this.WeekdayOrdinal.HasValue)
            {
                node.SetAttribute("weekdayOrdinal", this.WeekdayOrdinal.ToString());
            }

            if (this.WeekOfMonth.HasValue)
            {
                node.SetAttribute("weekOfMonth", this.WeekOfMonth.ToString());
            }

            if (this.Month.HasValue)
            {
                node.SetAttribute("month", this.Month.ToString());
            }

            if (this.Year.HasValue)
            {
                node.SetAttribute("year", this.Year.ToString());
            }

            return node.GetXml();
        }
    }
}
