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
    using System;

    internal class Request
    {
        /// <summary>
        /// The right trigger for the options
        /// </summary>
        private readonly Trigger.DateTrigger trigger;

        /// <summary>
        /// How often the trigger shall occur.
        /// </summary>
        private readonly int count;

        /// <summary>
        /// The trigger spec.
        /// </summary>
        private readonly Toast.Trigger spec;

        /// <summary>
        /// The current trigger date.
        /// </summary>
        private DateTime? triggerDate;

        /// <summary>
        /// Initializes a new instance of the <see cref="Request"/> class.
        /// </summary>
        /// <param name="options">The options spec.</param>
        public Request(Options options)
        {
            this.Options = options;
            this.spec = options.Trigger;
            this.count = Math.Max(this.spec.Count, 1);
            this.trigger = this.BuildTrigger();
            this.triggerDate = this.trigger.GetNextTriggerDate(this.GetBaseDate());
        }

        /// <summary>
        /// Gets the options spec.
        /// </summary>
        public Options Options { get; private set; }

        /// <summary>
        /// Gets the value of the internal occurrence counter.
        /// </summary>
        public int Occurrence { get => this.trigger.Occurrence; }

        /// <summary>
        /// Gets a value indicating whether there's one more trigger date to calculate.
        /// </summary>
        public bool HasNext { get => this.triggerDate.HasValue && this.Occurrence <= this.count; }

        /// <summary>
        /// Gets the current trigger date.
        /// </summary>
        public DateTime? TriggerDate
        {
            get
            {
                if (!this.triggerDate.HasValue)
                {
                    return null;
                }

                if (this.spec.Before != 0)
                {
                    var before = this.ToDateTime(this.spec.Before);

                    if (this.triggerDate.Value >= before)
                    {
                        return null;
                    }
                }

                var minDate = DateTime.Now.AddSeconds(0.2);

                if (this.triggerDate >= minDate)
                {
                    return this.triggerDate;
                }

                if ((minDate - this.triggerDate).Value.TotalMinutes <= 1)
                {
                    return minDate;
                }

                return null;
            }
        }

        /// <summary>
        /// Moves the internal occurrence counter by one.
        /// </summary>
        /// <returns>false if it wasnt possible anymore to move ahead.</returns>
        public bool MoveNext()
        {
            if (this.HasNext)
            {
                this.triggerDate = this.GetNextTriggerDate();
            }
            else
            {
                this.triggerDate = null;
            }

            return this.triggerDate.HasValue;
        }

        /// <summary>
        /// Gets the next trigger date based on the current trigger date.
        /// </summary>
        /// <returns>null if there's no next one.</returns>
        private DateTime? GetNextTriggerDate()
        {
            if (this.triggerDate.HasValue)
            {
                return this.trigger.GetNextTriggerDate(this.triggerDate.Value);
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// Build the trigger specified in options.
        /// </summary>
        /// <returns>Configured trigger instance</returns>
        private Trigger.DateTrigger BuildTrigger()
        {
            if (this.spec.Every is Toast.Every)
            {
                var matchers = this.GetMatchers();
                var specials = this.GetSpecials();

                return new Trigger.MatchTrigger(matchers, specials);
            }

            var unit = this.GetUnit();
            var ticks = this.GetTicks();

            return new Trigger.IntervalTrigger(ticks, unit);
        }

        /// <summary>
        /// Gets the unit value.
        /// </summary>
        /// <returns>SECOND by default.</returns>
        private Trigger.DateTrigger.Unit GetUnit()
        {
            var unit = "SECOND";

            if (!string.IsNullOrEmpty(this.spec.Unit))
            {
                unit = this.spec.Unit;
            }
            else if (this.spec.Every is string)
            {
                unit = this.spec.Every as string;
            }

            return (Trigger.DateTrigger.Unit)Enum.Parse(
                typeof(Trigger.DateTrigger.Unit), unit.ToUpper());
        }

        /// <summary>
        /// Gets the tick value.
        /// </summary>
        /// <returns>Defaults to 0</returns>
        private int GetTicks()
        {
            if (this.spec.At != 0)
            {
                return 0;
            }
            else if (this.spec.In != 0)
            {
                return this.spec.In;
            }
            else if (this.spec.Every is string)
            {
                return 1;
            }
            else if (this.spec.Every is double)
            {
                return Convert.ToInt32(this.spec.Every);
            }

            return 0;
        }

        /// <summary>
        /// Gets an array of all date parts to construct a datetime instance.
        /// </summary>
        /// <returns>[min, hour, day, month, year]</returns>
        private int?[] GetMatchers()
        {
            var every = this.spec.Every as Toast.Every;

            return new int?[]
            {
                every.Minute, every.Hour, every.Day, every.Month, every.Year
            };
        }

        /// <summary>
        /// Gets an array of all date parts to construct a datetime instance.
        /// </summary>
        /// <returns>[weekday, weekdayOrdinal, weekOfMonth, quarter]</returns>
        private int?[] GetSpecials()
        {
            var every = this.spec.Every as Toast.Every;

            return new int?[]
            {
                every.Weekday, every.WeekdayOrdinal, every.WeekOfMonth, every.Quarter
            };
        }

        /// <summary>
        /// Gets the base date from where to calculate the next trigger date.
        /// </summary>
        /// <returns>Usually points to now</returns>
        private DateTime GetBaseDate()
        {
            if (this.spec.At != 0)
            {
                return this.ToDateTime(this.spec.At);
            }
            else if (this.spec.FirstAt != 0)
            {
                return this.ToDateTime(this.spec.FirstAt);
            }
            else if (this.spec.After != 0)
            {
                return this.ToDateTime(this.spec.After);
            }

            return DateTime.Now;
        }

        /// <summary>
        /// Unix time from milliseconds.
        /// </summary>
        /// <param name="ms">Milliseconds </param>
        /// <returns>DateTime object.</returns>
        private DateTime ToDateTime(long ms)
        {
            return DateTimeOffset.FromUnixTimeMilliseconds(ms).LocalDateTime;
        }
    }
}
