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

namespace LocalNotificationProxy.LocalNotification.Trigger
{
    using System;

    internal abstract class DateTrigger
    {
        /// <summary>
        /// Default unit is SECOND
        /// </summary>
        public enum Unit : byte
        {
            NULL, SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR
        }

        /// <summary>
        /// Gets or sets the occurrence counter.
        /// </summary>
        public int Occurrence { get; protected set; } = 1;

        /// <summary>
        /// Gets the next trigger date.
        /// </summary>
        /// <param name="date">The date from where to calculate the next one.</param>
        /// <returns>Null if there is no next trigger date.</returns>
        public abstract DateTime? GetNextTriggerDate(DateTime date);
    }
}
