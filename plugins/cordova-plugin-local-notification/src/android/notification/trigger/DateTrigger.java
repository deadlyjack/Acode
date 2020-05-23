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

abstract public class DateTrigger {

    // Default unit is SECOND
    public enum Unit { SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR }

    // Internal counter
    private int occurrence = 1;

    /**
     * Gets the next trigger date.
     *
     * @param base The date from where to calculate the trigger date.
     *
     * @return null if there's none next trigger date.
     */
    abstract public Date getNextTriggerDate(Date base);

    /**
     * The value of the occurrence.
     */
    public int getOccurrence() {
        return occurrence;
    }

    /**
     * Increase the occurrence by 1.
     */
    void incOccurrence() {
        occurrence += 1;
    }

    /**
     * Gets a calendar instance pointing to the specified date.
     *
     * @param date The date to point.
     */
    Calendar getCal (Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);

        return cal;
    }

}