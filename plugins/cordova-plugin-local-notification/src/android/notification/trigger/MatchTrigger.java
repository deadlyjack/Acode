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

package de.appplant.cordova.plugin.notification.trigger;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import static de.appplant.cordova.plugin.notification.trigger.DateTrigger.Unit.DAY;
import static de.appplant.cordova.plugin.notification.trigger.DateTrigger.Unit.HOUR;
import static de.appplant.cordova.plugin.notification.trigger.DateTrigger.Unit.MINUTE;
import static de.appplant.cordova.plugin.notification.trigger.DateTrigger.Unit.MONTH;
import static de.appplant.cordova.plugin.notification.trigger.DateTrigger.Unit.WEEK;
import static de.appplant.cordova.plugin.notification.trigger.DateTrigger.Unit.YEAR;
import static java.util.Calendar.DAY_OF_WEEK;
import static java.util.Calendar.WEEK_OF_MONTH;
import static java.util.Calendar.WEEK_OF_YEAR;

/**
 * Trigger for date matching components.
 */
public class MatchTrigger extends IntervalTrigger {

    // Used to determine the interval
    private static Unit[] INTERVALS = { null, MINUTE, HOUR, DAY, MONTH, YEAR };

    // Maps these crap where Sunday is the 1st day of the week
    private static int[] WEEKDAYS = { 0, 2, 3, 4, 5, 6, 7, 1 };

    // Maps these crap where Sunday is the 1st day of the week
    private static int[] WEEKDAYS_REV = { 0, 7, 1, 2, 3, 4, 5, 6 };

    // The date matching components
    private final List<Integer> matchers;

    // The special matching components
    private final List<Integer> specials;

    private static Unit getUnit(List<Integer> matchers, List<Integer> specials) {
        Unit unit1 = INTERVALS[1 + matchers.indexOf(null)], unit2 = null;

        if (specials.get(0) != null) {
            unit2 = WEEK;
        }

        if (unit2 == null)
            return unit1;

        return (unit1.compareTo(unit2) < 0) ? unit2 : unit1;
    }

    /**
     * Date matching trigger from now.
     *
     * @param matchers Describes the date matching parts.
     *                 { day: 15, month: ... }
     * @param specials Describes the date matching parts.
     *                 { weekday: 1, weekOfMonth: ... }
     */
    public MatchTrigger(List<Integer> matchers, List<Integer> specials) {
        super(1, getUnit(matchers, specials));

        if (specials.get(0) != null) {
            specials.set(0, WEEKDAYS[specials.get(0)]);
        }

        this.matchers = matchers;
        this.specials = specials;
    }

    /**
     * Gets the date from where to start calculating the initial trigger date.
     */
    private Calendar getBaseTriggerDate(Date date) {
        Calendar cal = getCal(date);

        cal.set(Calendar.SECOND, 0);

        if (matchers.get(0) != null) {
            cal.set(Calendar.MINUTE, matchers.get(0));
        } else {
            cal.set(Calendar.MINUTE, 0);
        }

        if (matchers.get(1) != null) {
            cal.set(Calendar.HOUR_OF_DAY, matchers.get(1));
        } else {
            cal.set(Calendar.HOUR_OF_DAY, 0);
        }

        if (matchers.get(2) != null) {
            cal.set(Calendar.DAY_OF_MONTH, matchers.get(2));
        }

        if (matchers.get(3) != null) {
            cal.set(Calendar.MONTH, matchers.get(3) - 1);
        }

        if (matchers.get(4) != null) {
            cal.set(Calendar.YEAR, matchers.get(4));
        }

        return cal;
    }

    /**
     * Gets the date when to trigger the notification.
     *
     * @param base The date from where to calculate the trigger date.
     *
     * @return null if there's none trigger date.
     */
    private Date getTriggerDate (Date base) {
        Calendar cal = getBaseTriggerDate(base);
        Calendar now = getCal(base);

        if (cal.compareTo(now) >= 0)
            return applySpecials(cal);

        if (unit == null || cal.get(Calendar.YEAR) < now.get(Calendar.YEAR))
            return null;

        if (cal.get(Calendar.MONTH) < now.get(Calendar.MONTH)) {
            switch (unit) {
                case MINUTE:
                case HOUR:
                case DAY:
                case WEEK:
                    if (matchers.get(4) == null) {
                        addToDate(cal, now, Calendar.YEAR, 1);
                        break;
                    } else
                        return null;
                case YEAR:
                    addToDate(cal, now, Calendar.YEAR, 1);
                    break;
            }
        } else
        if (cal.get(Calendar.DAY_OF_YEAR) < now.get(Calendar.DAY_OF_YEAR)) {
            switch (unit) {
                case MINUTE:
                case HOUR:
                    if (matchers.get(3) == null) {
                        addToDate(cal, now, Calendar.MONTH, 1);
                        break;
                    } else
                    if (matchers.get(4) == null) {
                        addToDate(cal, now, Calendar.YEAR, 1);
                        break;
                    }
                    else
                        return null;
                case MONTH:
                    addToDate(cal, now, Calendar.MONTH, 1);
                    break;
                case YEAR:
                    addToDate(cal, now, Calendar.YEAR, 1);
                    break;
            }
        } else
        if (cal.get(Calendar.HOUR_OF_DAY) < now.get(Calendar.HOUR_OF_DAY)) {
            switch (unit) {
                case MINUTE:
                    if (matchers.get(2) == null) {
                        addToDate(cal, now, Calendar.DAY_OF_YEAR, 1);
                        break;
                    } else
                    if (matchers.get(3) == null) {
                        addToDate(cal, now, Calendar.MONTH, 1);
                        break;
                    }
                    else
                        return null;
                case HOUR:
                    addToDate(cal, now, Calendar.HOUR_OF_DAY, 0);
                    break;
                case DAY:
                case WEEK:
                    addToDate(cal, now, Calendar.DAY_OF_YEAR, 1);
                    break;
                case MONTH:
                    addToDate(cal, now, Calendar.MONTH, 1);
                    break;
                case YEAR:
                    addToDate(cal, now, Calendar.YEAR, 1);
                    break;
            }
        } else
        if (cal.get(Calendar.MINUTE) < now.get(Calendar.MINUTE)) {
            switch (unit) {
                case MINUTE:
                    addToDate(cal, now, Calendar.MINUTE, 1);
                    break;
                case HOUR:
                    addToDate(cal, now, Calendar.HOUR_OF_DAY, 1);
                    break;
                case DAY:
                case WEEK:
                    addToDate(cal, now, Calendar.DAY_OF_YEAR, 1);
                    break;
                case MONTH:
                    addToDate(cal, now, Calendar.MONTH, 1);
                    break;
                case YEAR:
                    addToDate(cal, now, Calendar.YEAR, 1);
                    break;
            }
        }

        return applySpecials(cal);
    }

    private Date applySpecials (Calendar cal) {
        if (specials.get(2) != null && !setWeekOfMonth(cal))
            return null;

        if (specials.get(0) != null && !setDayOfWeek(cal))
            return null;

        return cal.getTime();
    }

    /**
     * Gets the next trigger date.
     *
     * @param base The date from where to calculate the trigger date.
     *
     * @return null if there's none next trigger date.
     */
    @Override
    public Date getNextTriggerDate (Date base) {
        Date date = base;

        if (getOccurrence() > 1) {
            Calendar cal = getCal(base);
            addInterval(cal);
            date = cal.getTime();
        }

        incOccurrence();

        return getTriggerDate(date);
    }

    /**
     * Sets the field value of now to date and adds by count.
     */
    private void addToDate (Calendar cal, Calendar now, int field, int count) {
        cal.set(field, now.get(field));
        cal.add(field, count);
    }

    /**
     * Set the day of the year but ensure that the calendar does point to a
     * date in future.
     *
     * @param cal   The calendar to manipulate.
     *
     * @return true if the operation could be made.
     */
    private boolean setDayOfWeek (Calendar cal) {
        cal.setFirstDayOfWeek(Calendar.MONDAY);
        int day      = WEEKDAYS_REV[cal.get(DAY_OF_WEEK)];
        int month    = cal.get(Calendar.MONTH);
        int year     = cal.get(Calendar.YEAR);
        int dayToSet = WEEKDAYS_REV[specials.get(0)];

        if (matchers.get(2) != null)
            return false;

        if (day > dayToSet) {
            if (specials.get(2) == null) {
                cal.add(WEEK_OF_YEAR, 1);
            } else
            if (matchers.get(3) == null) {
                cal.add(Calendar.MONTH, 1);
            } else
            if (matchers.get(4) == null) {
                cal.add(Calendar.YEAR, 1);
            } else
                return false;
        }

        cal.set(DAY_OF_WEEK, specials.get(0));

        if (matchers.get(3) != null && cal.get(Calendar.MONTH) != month)
            return false;

        //noinspection RedundantIfStatement
        if (matchers.get(4) != null && cal.get(Calendar.YEAR) != year)
            return false;

        return true;
    }

    /**
     * Set the week of the month but ensure that the calendar does point to a
     * date in future.
     *
     * @param cal The calendar to manipulate.
     *
     * @return true if the operation could be made.
     */
    private boolean setWeekOfMonth (Calendar cal) {
        int week      = cal.get(WEEK_OF_MONTH);
        int year      = cal.get(Calendar.YEAR);
        int weekToSet = specials.get(2);

        if (week > weekToSet) {
            if (matchers.get(3) == null) {
                cal.add(Calendar.MONTH, 1);
            } else
            if (matchers.get(4) == null) {
                cal.add(Calendar.YEAR, 1);
            } else
                return false;

            if (matchers.get(4) != null && cal.get(Calendar.YEAR) != year)
                return false;
        }

        int month = cal.get(Calendar.MONTH);

        cal.set(WEEK_OF_MONTH, weekToSet);

        if (cal.get(Calendar.MONTH) != month) {
            cal.set(Calendar.DAY_OF_MONTH, 1);
            cal.set(Calendar.MONTH, month);
        } else
        if (matchers.get(2) == null && week != weekToSet) {
            cal.set(DAY_OF_WEEK, 2);
        }

        return true;
    }
}