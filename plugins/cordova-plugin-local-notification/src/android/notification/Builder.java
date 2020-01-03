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

package de.appplant.cordova.plugin.notification;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationCompat.MessagingStyle.Message;
import android.support.v4.media.app.NotificationCompat.MediaStyle;
import android.support.v4.media.session.MediaSessionCompat;

import java.util.List;
import java.util.Random;

import de.appplant.cordova.plugin.notification.action.Action;

import static android.app.PendingIntent.FLAG_CANCEL_CURRENT;
import static android.app.PendingIntent.FLAG_UPDATE_CURRENT;
import static de.appplant.cordova.plugin.notification.Notification.EXTRA_UPDATE;

/**
 * Builder class for local notifications. Build fully configured local
 * notification specified by JSON object passed from JS side.
 */
public final class Builder {

    // Application context passed by constructor
    private final Context context;

    // Notification options passed by JS
    private final Options options;

    // To generate unique request codes
    private final Random random = new Random();

    // Receiver to handle the clear event
    private Class<?> clearReceiver;

    // Activity to handle the click event
    private Class<?> clickActivity;

    // Additional extras to merge into each intent
    private Bundle extras;

    /**
     * Constructor
     *
     * @param options Notification options
     */
    public Builder(Options options) {
        this.context = options.getContext();
        this.options = options;
    }

    /**
     * Set clear receiver.
     *
     * @param receiver Broadcast receiver for the clear event.
     */
    public Builder setClearReceiver(Class<?> receiver) {
        this.clearReceiver = receiver;
        return this;
    }

    /**
     * Set click activity.
     *
     * @param activity The activity to handler the click event.
     */
    public Builder setClickActivity(Class<?> activity) {
        this.clickActivity = activity;
        return this;
    }

    /**
     * Set bundle extras.
     *
     * @param extras The bundled extras to merge into.
     */
    public Builder setExtras(Bundle extras) {
        this.extras = extras;
        return this;
    }

    /**
     * Creates the notification with all its options passed through JS.
     *
     * @return The final notification to display.
     */
    public Notification build() {
        NotificationCompat.Builder builder;

        if (options.isSilent()) {
            return new Notification(context, options);
        }

        Uri sound     = options.getSound();
        Bundle extras = new Bundle();

        extras.putInt(Notification.EXTRA_ID, options.getId());
        extras.putString(Options.EXTRA_SOUND, sound.toString());

        builder = findOrCreateBuilder()
                .setDefaults(options.getDefaults())
                .setExtras(extras)
                .setOnlyAlertOnce(false)
                .setChannelId(options.getChannel())
                .setContentTitle(options.getTitle())
                .setContentText(options.getText())
                .setTicker(options.getText())
                .setNumber(options.getNumber())
                .setAutoCancel(options.isAutoClear())
                .setOngoing(options.isSticky())
                .setColor(options.getColor())
                .setVisibility(options.getVisibility())
                .setPriority(options.getPriority())
                .setShowWhen(options.getShowWhen())
                .setUsesChronometer(options.isWithProgressBar())
                .setGroup(options.getGroup())
                .setGroupSummary(options.getGroupSummary())
                .setLights(options.getLedColor(), options.getLedOn(), options.getLedOff());

        if (sound != Uri.EMPTY && !isUpdate()) {
            builder.setSound(sound);
        }

        if (options.isWithProgressBar()) {
            builder.setProgress(
                    options.getProgressMaxValue(),
                    options.getProgressValue(),
                    options.isIndeterminateProgress());
        }

        if (options.hasLargeIcon()) {
            builder.setSmallIcon(options.getSmallIcon());
            builder.setLargeIcon(options.getLargeIcon());
        } else {
            builder.setSmallIcon(options.getSmallIcon());
        }

        applyStyle(builder);
        applyActions(builder);
        applyDeleteReceiver(builder);
        applyContentReceiver(builder);

        return new Notification(context, options, builder);
    }

    /**
     * Find out and set the notification style.
     *
     * @param builder Local notification builder instance.
     */
    private void applyStyle(NotificationCompat.Builder builder) {
        Message[] messages = options.getMessages();
        String summary     = options.getSummary();

        if (messages != null) {
            applyMessagingStyle(builder, messages);
            return;
        }

        MediaSessionCompat.Token token = options.getMediaSessionToken();

        if (token != null) {
            applyMediaStyle(builder, token);
            return;
        }

        List<Bitmap> pics = options.getAttachments();

        if (pics.size() > 0) {
            applyBigPictureStyle(builder, pics);
            return;
        }

        String text = options.getText();

        if (text != null && text.contains("\n")) {
            applyInboxStyle(builder);
            return;
        }

        if (text == null || summary == null && text.length() < 45)
            return;

        applyBigTextStyle(builder);
    }

    /**
     * Apply inbox style.
     *
     * @param builder  Local notification builder instance.
     * @param messages The messages to add to the conversation.
     */
    private void applyMessagingStyle(NotificationCompat.Builder builder,
                                     Message[] messages) {

        NotificationCompat.MessagingStyle style;

        style = new NotificationCompat.MessagingStyle("Me")
                .setConversationTitle(options.getTitle());

        for (Message msg : messages) {
            style.addMessage(msg);
        }

        builder.setStyle(style);
    }

    /**
     * Apply inbox style.
     *
     * @param builder Local notification builder instance.
     * @param pics    The pictures to show.
     */
    private void applyBigPictureStyle(NotificationCompat.Builder builder,
                                      List<Bitmap> pics) {

        NotificationCompat.BigPictureStyle style;
        String summary = options.getSummary();
        String text    = options.getText();

        style = new NotificationCompat.BigPictureStyle(builder)
                .setSummaryText(summary == null ? text : summary)
                .bigPicture(pics.get(0));

        builder.setStyle(style);
    }

    /**
     * Apply inbox style.
     *
     * @param builder Local notification builder instance.
     */
    private void applyInboxStyle(NotificationCompat.Builder builder) {
        NotificationCompat.InboxStyle style;
        String text = options.getText();

        style = new NotificationCompat.InboxStyle(builder)
                .setSummaryText(options.getSummary());

        for (String line : text.split("\n")) {
            style.addLine(line);
        }

        builder.setStyle(style);
    }

    /**
     * Apply big text style.
     *
     * @param builder Local notification builder instance.
     */
    private void applyBigTextStyle(NotificationCompat.Builder builder) {
        NotificationCompat.BigTextStyle style;

        style = new NotificationCompat.BigTextStyle(builder)
                .setSummaryText(options.getSummary())
                .bigText(options.getText());

        builder.setStyle(style);
    }

    /**
     * Apply media style.
     *
     * @param builder Local notification builder instance.
     * @param token   The media session token.
     */
    private void applyMediaStyle(NotificationCompat.Builder builder,
                                 MediaSessionCompat.Token token) {
        MediaStyle style;

        style = new MediaStyle(builder)
                .setMediaSession(token)
                .setShowActionsInCompactView(1);

        builder.setStyle(style);
    }

    /**
     * Set intent to handle the delete event. Will clean up some persisted
     * preferences.
     *
     * @param builder Local notification builder instance.
     */
    private void applyDeleteReceiver(NotificationCompat.Builder builder) {

        if (clearReceiver == null)
            return;

        Intent intent = new Intent(context, clearReceiver)
                .putExtras(extras)
                .setAction(options.getIdentifier())
                .putExtra(Notification.EXTRA_ID, options.getId());

        int reqCode = random.nextInt();

        PendingIntent deleteIntent = PendingIntent.getBroadcast(
                context, reqCode, intent, FLAG_UPDATE_CURRENT);

        builder.setDeleteIntent(deleteIntent);
    }

    /**
     * Set intent to handle the click event. Will bring the app to
     * foreground.
     *
     * @param builder Local notification builder instance.
     */
    private void applyContentReceiver(NotificationCompat.Builder builder) {

        if (clickActivity == null)
            return;

        Intent intent = new Intent(context, clickActivity)
                .putExtras(extras)
                .putExtra(Notification.EXTRA_ID, options.getId())
                .putExtra(Action.EXTRA_ID, Action.CLICK_ACTION_ID)
                .putExtra(Options.EXTRA_LAUNCH, options.isLaunchingApp())
                .setFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);

        int reqCode = random.nextInt();

        PendingIntent contentIntent = PendingIntent.getActivity(
                context, reqCode, intent, FLAG_UPDATE_CURRENT);

        builder.setContentIntent(contentIntent);
    }

    /**
     * Add all actions to the builder if there are any actions.
     *
     * @param builder Local notification builder instance.
     */
    private void applyActions (NotificationCompat.Builder builder) {
        Action[] actions = options.getActions();
        NotificationCompat.Action.Builder btn;

        if (actions == null || actions.length == 0)
            return;

        for (Action action : actions) {
             btn = new NotificationCompat.Action.Builder(
                     action.getIcon(), action.getTitle(),
                     getPendingIntentForAction(action));

            if (action.isWithInput()) {
                btn.addRemoteInput(action.getInput());
            }

            builder.addAction(btn.build());
        }
    }

    /**
     * Returns a new PendingIntent for a notification action, including the
     * action's identifier.
     *
     * @param action Notification action needing the PendingIntent
     */
    private PendingIntent getPendingIntentForAction (Action action) {
        Intent intent = new Intent(context, clickActivity)
                .putExtras(extras)
                .putExtra(Notification.EXTRA_ID, options.getId())
                .putExtra(Action.EXTRA_ID, action.getId())
                .putExtra(Options.EXTRA_LAUNCH, action.isLaunchingApp())
                .setFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);

        int reqCode = random.nextInt();

        return PendingIntent.getActivity(
                context, reqCode, intent, FLAG_CANCEL_CURRENT);
    }

    /**
     * If the builder shall build an notification or an updated version.
     *
     * @return true in case of an updated version.
     */
    private boolean isUpdate() {
        return extras != null && extras.getBoolean(EXTRA_UPDATE, false);
    }

    /**
     * Returns a cached builder instance or creates a new one.
     */
    private NotificationCompat.Builder findOrCreateBuilder() {
        int key = options.getId();
        NotificationCompat.Builder builder = Notification.getCachedBuilder(key);

        if (builder == null) {
            builder = new NotificationCompat.Builder(context, options.getChannel());
        }

        return builder;
    }

}
