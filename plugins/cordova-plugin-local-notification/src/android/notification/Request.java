/*
 * Copyright (c) 2014-2015 by appPlant UG. All rights reserved.
 *
 * @APPPLANT_LICENSE_HEADER_START@
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
 *
 * @APPPLANT_LICENSE_HEADER_END@
 */

package de.appplant.cordova.plugin.notification;

import org.json.JSONObject;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import de.appplant.cordova.plugin.notification.trigger.DateTrigger;
import de.appplant.cordova.plugin.notification.trigger.IntervalTrigger;
import de.appplant.cordova.plugin.notification.trigger.MatchTrigger;

import static de.appplant.cordova.plugin.notification.trigger.IntervalTrigger.Unit;

/**
 * An object you use to specify a notification’s content and the condition
 * that triggers its delivery.
 */
public final class Request {

    // Key name for bundled extras
    static final String EXTRA_OCCURRENCE = "NOTIFICATION_OCCURRENCE";

    // Key name for bundled extras
    public static final String EXTRA_LAST = "NOTIFICATION_LAST";

    // The options spec
    private final Options options;

    // The right trigger for the options
    private final DateTrigger trigger;

    // How often the trigger shall occur
    private final int count;

    // The trigger spec
    private final JSONObject spec;

    // The current trigger date
    private Date triggerDate;

    /**
     * Constructor
     *
     * @param options The options spec.
     */
    public Request(Options options) {
        this.options     = options;
        this.spec        = options.getTrigger();
        this.count       = Math.max(spec.optInt("count"), 1);
        this.trigger     = buildTrigger();
        this.triggerDate = trigger.getNextTriggerDate(getBaseDate());
    }

    /**
     * Gets the options spec.
     */
    public Options getOptions() {
        return options;
    }

    /**
     * The identifier for the request.
     *
     * @return The notification ID as the string
     */
    String getIdentifier() {
        return options.getId().toString() + "-" + getOccurrence();
    }

    /**
     * The value of the internal occurrence counter.
     */
    int getOccurrence() {
        return trigger.getOccurrence();
    }

    /**
     * If there's one more trigger date to calculate.
     */
    private boolean hasNext() {
        return triggerDate != null && getOccurrence() <= count;
    }

    /**
     * Moves the internal occurrence counter by one.
     */
    boolean moveNext() {
        if (hasNext()) {
            triggerDate = getNextTriggerDate();
        } else {
            triggerDate = null;
        }

        return this.triggerDate != null;
    }

    /**
     * Gets the current trigger date.
     *
     * @return null if there's no trigger date.
     */
    Date getTriggerDate() {
        Calendar now = Calendar.getInstance();

        if (triggerDate == null)
            return null;

        long time = triggerDate.getTime();

        if ((now.getTimeInMillis() - time) > 60000)
            return null;

        if (time >= spec.optLong("before", time + 1))
            return null;

        return triggerDate;
    }

    /**
     * Gets the next trigger date based on the current trigger date.
     */
    private Date getNextTriggerDate() {
        return trigger.getNextTriggerDate(triggerDate);
    }

    /**
     * Build the trigger specified in options.
     */
    private DateTrigger buildTrigger() {
        Object every = spec.opt("every");

        if (every instanceof JSONObject) {
            List<Integer> cmp1 = getMatchingComponents();
            List<Integer> cmp2 = getSpecialMatchingComponents();

            return new MatchTrigger(cmp1, cmp2);
        }

        Unit unit = getUnit();
        int ticks = getTicks();

        return new IntervalTrigger(ticks, unit);
    }

    /**
     * Gets the unit value.
     */
    private Unit getUnit() {
        Object every = spec.opt("every");
        String unit  = "SECOND";

        if (spec.has("unit")) {
            unit = spec.optString("unit", "second");
        } else
        if (every instanceof String) {
            unit = spec.optString("every", "second");
        }

        return Unit.valueOf(unit.toUpperCase());
    }

    /**
     * Gets the tick value.
     */
    private int getTicks() {
        Object every = spec.opt("every");
        int ticks    = 0;

        if (spec.has("at")) {
            ticks = 0;
        } else
        if (spec.has("in")) {
            ticks = spec.optInt("in", 0);
        } else
        if (every instanceof String) {
            ticks = 1;
        } else
        if (!(every instanceof JSONObject)) {
            ticks = spec.optInt("every", 0);
        }

        return ticks;
    }

    /**
     * Gets an array of all date parts to construct a datetime instance.
     *
     * @return [min, hour, day, month, year]
     */
    private List<Integer> getMatchingComponents() {
        JSONObject every = spec.optJSONObject("every");

        return Arrays.asList(
                (Integer) every.opt("minute"),
                (Integer) every.opt("hour"),
                (Integer) every.opt("day"),
                (Integer) every.opt("month"),
                (Integer) every.opt("year")
        );
    }

    /**
     * Gets an array of all date parts to construct a datetime instance.
     *
     * @return [min, hour, day, month, year]
     */
    private List<Integer> getSpecialMatchingComponents() {
        JSONObject every = spec.optJSONObject("every");

        return Arrays.asList(
                (Integer) every.opt("weekday"),
                (Integer) every.opt("weekdayOrdinal"),
                (Integer) every.opt("weekOfMonth"),
                (Integer) every.opt("quarter")
        );
    }

    /**
     * Gets the base date from where to calculate the next trigger date.
     */
    private Date getBaseDate() {
        if (spec.has("at")) {
            return new Date(spec.optLong("at", 0));
        } else
        if (spec.has("firstAt")) {
            return new Date(spec.optLong("firstAt", 0));
        } else
        if (spec.has("after")) {
            return new Date(spec.optLong("after", 0));
        } else {
            return new Date();
        }
    }

}
