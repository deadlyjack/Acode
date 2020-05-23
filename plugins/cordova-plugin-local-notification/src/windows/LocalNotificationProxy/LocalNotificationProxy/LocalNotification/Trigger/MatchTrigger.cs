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
    using System.Globalization;

    internal class MatchTrigger : IntervalTrigger
    {
        /// <summary>
        /// Used to determine the interval
        /// </summary>
        private static readonly Unit?[] INTERVALS = { null, Unit.MINUTE, Unit.HOUR, Unit.DAY, Unit.MONTH, Unit.YEAR };

        /// <summary>
        /// Maps these crap where Sunday is the 1st day of the week.
        /// </summary>
        private static readonly int[] WEEKDAYS = { 7, 1, 2, 3, 4, 5, 6 };

        /// <summary>
        /// The matching components.
        /// </summary>
        private readonly int?[] matchers;

        /// <summary>
        /// The special matching components.
        /// </summary>
        private readonly int?[] specials;

        /// <summary>
        /// Initializes a new instance of the <see cref="MatchTrigger"/> class.
        /// </summary>
        /// <param name="matchers">The matching components.</param>
        /// <param name="specials">The special matching components.</param>
        public MatchTrigger(int?[] matchers, int?[] specials)
            : base(1, GetUnit(matchers, specials))
        {
            this.matchers = matchers;
            this.specials = specials;
        }

        /// <summary>
        /// Gets the next trigger date.
        /// </summary>
        /// <param name="baseDate">The date from where to calculate the next one.</param>
        /// <returns>Null if there is no next trigger date.</returns>
        public override DateTime? GetNextTriggerDate(DateTime baseDate)
        {
            DateTime date = baseDate;

            if (this.Occurrence > 1)
            {
                date = this.AddInterval(baseDate);
            }

            this.Occurrence += 1;

            return this.GetTriggerDate(date);
        }

        /// <summary>
        /// Gets the unit interval specified by the matching components.
        /// </summary>
        /// <param name="matchers">The matching components.</param>
        /// <param name="specials">The special matching components.</param>
        /// <returns>The interval unit.</returns>
        private static Unit GetUnit(int?[] matchers, int?[] specials)
        {
            Unit unit1 = INTERVALS[1 + Array.IndexOf(matchers, null)].GetValueOrDefault(Unit.NULL),
                 unit2 = Unit.NULL;

            if (specials[0].HasValue)
            {
                unit2 = Unit.WEEK;
            }

            if (unit2 == Unit.NULL)
            {
                return unit1;
            }

            return (unit1.CompareTo(unit2) < 0) ? unit2 : unit1;
        }

        /// <summary>
        /// Gets the date from where to start calculating the initial trigger date.
        /// </summary>
        /// <param name="date">Usually now.</param>
        /// <returns>The initial trigger date.</returns>
        private DateTime GetBaseTriggerDate(DateTime date)
        {
            return new DateTime(
                this.matchers[4].GetValueOrDefault(date.Year),
                this.matchers[3].GetValueOrDefault(date.Month),
                this.matchers[2].GetValueOrDefault(date.Day),
                this.matchers[1].GetValueOrDefault(0),
                this.matchers[0].GetValueOrDefault(0),
                0);
        }

        /// <summary>
        /// Gets the date when to trigger the notification.
        /// </summary>
        /// <param name="now">The date from where to calculate the trigger date.</param>
        /// <returns>null if there's none trigger date.</returns>
        private DateTime? GetTriggerDate(DateTime now)
        {
            var date = this.GetBaseTriggerDate(now);

            if (date >= now)
            {
                return this.ApplySpecials(date);
            }

            if (this.Unit == Unit.NULL || date.Year < now.Year)
            {
                return null;
            }

            if (date.Month < now.Month)
            {
                switch (this.Unit)
                {
                    case Unit.MINUTE:
                    case Unit.HOUR:
                    case Unit.DAY:
                    case Unit.WEEK:
                        if (!this.matchers[4].HasValue)
                        {
                            date = date.AddYears(now.Year - date.Year + 1);
                            break;
                        }
                        else
                        {
                            return null;
                        }

                    case Unit.YEAR:
                        date = date.AddYears(now.Year - date.Year + 1);
                        break;
                }
            }
            else if (date.DayOfYear < now.DayOfYear)
            {
                switch (this.Unit)
                {
                    case Unit.MINUTE:
                    case Unit.HOUR:
                        if (!this.matchers[3].HasValue)
                        {
                            date = date.AddMonths(now.Month - date.Month + 1);
                        }
                        else if (!this.matchers[4].HasValue)
                        {
                            date = date.AddYears(now.Year - date.Year + 1);
                        }
                        else
                        {
                            return null;
                        }

                        break;
                    case Unit.MONTH:
                        date = date.AddMonths(now.Month - date.Month + 1);
                        break;
                    case Unit.YEAR:
                        date = date.AddYears(now.Year - date.Year + 1);
                        break;
                }
            }
            else if (date.Hour < now.Hour)
            {
                switch (this.Unit)
                {
                    case Unit.MINUTE:
                        if (!this.matchers[2].HasValue)
                        {
                            date = date.AddDays(now.DayOfYear - date.DayOfYear + 1);
                        }
                        else if (!this.matchers[3].HasValue)
                        {
                            date = date.AddMonths(now.Month - date.Month + 1);
                        }
                        else
                        {
                            return null;
                        }

                        break;
                    case Unit.HOUR:
                        date = date.AddHours(now.Hour - date.Hour);
                        break;
                    case Unit.DAY:
                    case Unit.WEEK:
                        date = date.AddDays(now.Day - date.Day + 1);
                        break;
                    case Unit.MONTH:
                        date = date.AddMonths(now.Month - date.Month + 1);
                        break;
                    case Unit.YEAR:
                        date.AddYears(now.Year - date.Year + 1);
                        break;
                }
            }
            else if (date.Minute < now.Minute)
            {
                switch (this.Unit)
                {
                    case Unit.MINUTE:
                        date = date.AddMinutes(now.Minute - date.Minute + 1);
                        break;
                    case Unit.HOUR:
                        date = date.AddHours(now.Hour - date.Hour + 1);
                        break;
                    case Unit.DAY:
                    case Unit.WEEK:
                        date = date.AddDays(now.DayOfYear - date.DayOfYear + 1);
                        break;
                    case Unit.MONTH:
                        date = date.AddMonths(now.Month - date.Month + 1);
                        break;
                    case Unit.YEAR:
                        date = date.AddYears(now.Year - date.Year + 1);
                        break;
                }
            }

            return this.ApplySpecials(date);
        }

        /// <summary>
        /// Applies the special matching components.
        /// </summary>
        /// <param name="date">The date to manipulate</param>
        /// <returns>The manipulated date.</returns>
        private DateTime? ApplySpecials(DateTime date)
        {
            DateTime? cal = date;

            if (this.specials[2].HasValue)
            {
                cal = this.SetWeekOfMonth(date);
            }

            if (this.specials[0].HasValue && cal.HasValue)
            {
                cal = this.SetDayOfWeek(cal.Value);
            }

            return cal;
        }

        /// <summary>
        /// Set the day of the year but ensure that the calendar does point to a
        /// date in future.
        /// </summary>
        /// <param name="date">The date to manipulate</param>
        /// <returns>The calculatred date or null if not possible</returns>
        private DateTime? SetDayOfWeek(DateTime date)
        {
            var day = WEEKDAYS[(int)date.DayOfWeek];
            var month = date.Month;
            var year = date.Year;
            var dayToSet = this.specials[0].Value;

            if (this.matchers[2].HasValue)
            {
                return null;
            }

            if (day > dayToSet)
            {
                if (!this.specials[2].HasValue)
                {
                    date = date.AddDays(7);
                }
                else if (!this.matchers[3].HasValue)
                {
                    date = date.AddMonths(1);
                }
                else if (!this.matchers[4].HasValue)
                {
                    date = date.AddYears(1);
                }
                else
                {
                    return null;
                }
            }

            date = date.AddDays(dayToSet - day);

            if (this.matchers[3].HasValue && date.Month != month)
            {
                return null;
            }

            if (this.matchers[4].HasValue && date.Year != year)
            {
                return null;
            }

            return date;
        }

        /// <summary>
        /// Set the day of the year but ensure that the calendar does point to a
        /// date in future.
        /// </summary>
        /// <param name="date">The date to manipulate</param>
        /// <returns>The calculatred date or null if not possible</returns>
        private DateTime? SetWeekOfMonth(DateTime date)
        {
            var week = this.GetWeekOFMonth(date);
            var year = date.Year;
            var weekToSet = this.specials[2].Value;

            if (week > weekToSet)
            {
                if (!this.matchers[3].HasValue)
                {
                    date = date.AddMonths(1);
                }
                else if (!this.matchers[4].HasValue)
                {
                    date = date.AddYears(1);
                }
                else
                {
                    return null;
                }

                if (this.matchers[4].HasValue && date.Year != year)
                {
                    return null;
                }
            }

            int month = date.Month;

            date = date.AddDays((weekToSet - week) * 7);

            if (date.Month != month)
            {
                date = new DateTime(date.Year, month, 1, date.Hour, date.Minute, 0);
            }
            else if (!this.matchers[2].HasValue && week != weekToSet)
            {
                date = date.AddDays(1 - WEEKDAYS[(int)date.DayOfWeek]);
            }

            return date;
        }

        /// <summary>
        /// Calculates the week of month for the given date.
        /// </summary>
        /// <param name="date">The date to calculate the week number</param>
        /// <returns>1..5</returns>
        private int GetWeekOFMonth(DateTime date)
        {
            var cal = CultureInfo.CurrentCulture.Calendar;
            var firstDay = new DateTime(date.Year, date.Month, 1);
            var weekOfDate = cal.GetWeekOfYear(date, CalendarWeekRule.FirstDay, DayOfWeek.Monday);
            var weekOfFirstDay = cal.GetWeekOfYear(firstDay, CalendarWeekRule.FirstDay, DayOfWeek.Monday);

            return weekOfDate - weekOfFirstDay + 1;
        }
    }
}
