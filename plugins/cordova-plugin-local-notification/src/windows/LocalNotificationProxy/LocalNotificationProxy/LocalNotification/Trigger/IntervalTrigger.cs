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

    internal class IntervalTrigger : DateTrigger
    {
        /// <summary>
        /// The number of ticks per interval.
        /// </summary>
        private readonly int ticks;

        /// <summary>
        /// Initializes a new instance of the <see cref="IntervalTrigger"/> class.
        /// </summary>
        /// <param name="ticks">The number of ticks per interval.</param>
        /// <param name="unit">The unit of the ticks.</param>
        public IntervalTrigger(int ticks, Unit unit)
        {
            this.ticks = ticks;
            this.Unit = unit;
        }

        /// <summary>
        /// Gets the unit of the ticks
        /// </summary>
        internal new Unit Unit { get; private set; }

        /// <summary>
        /// Gets the next trigger date.
        /// </summary>
        /// <param name="date">The date from where to calculate the next one.</param>
        /// <returns>Null if there is no next trigger date.</returns>
        public override DateTime? GetNextTriggerDate(DateTime date)
        {
            this.Occurrence += 1;
            return this.AddInterval(date);
        }

        /// <summary>
        /// Adds the interval to the specified date.
        /// </summary>
        /// <param name="date">The date where to add the interval of ticks</param>
        /// <returns>A new datetime instance</returns>
        protected DateTime AddInterval(DateTime date)
        {
            switch (this.Unit)
            {
                case Unit.SECOND:
                    return date.AddSeconds(this.ticks);
                case Unit.MINUTE:
                    return date.AddMinutes(this.ticks);
                case Unit.HOUR:
                    return date.AddHours(this.ticks);
                case Unit.DAY:
                    return date.AddDays(this.ticks);
                case Unit.WEEK:
                    return date.AddDays(this.ticks * 7);
                case Unit.MONTH:
                    return date.AddMonths(this.ticks);
                case Unit.QUARTER:
                    return date.AddMonths(this.ticks * 3);
                case Unit.YEAR:
                    return date.AddYears(this.ticks);
                default:
                    return date;
            }
        }
    }
}
