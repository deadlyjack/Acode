// Type definitions for cordova-plugin-x-toast.
// Project: https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin
// Definitions by: Microsoft
//
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

interface Window {
    plugins: CordovaPlugins;
}

interface CordovaPlugins {
    /**
     * This plugin provides API to show a native Toast (a little text popup) on iOS, Android and WP8
     */
    toast: Toast;
}

/**
 * Toast options
 */
interface ToastOptions {
    /**
     * message to pop up
     */
    message: string,

    /**
     * how long to show the toast - 'short', 'long'
     */
    duration: string,

    /**
     * where to show the toast - 'top', 'center', 'bottom'
     */
    position: string,

    /**
     * Toast options
     */
    addPixelsY?: number,

    /**
     * Toast options
     */
    data?: any
}

/**
 * Toast options
 */
interface ToastSuccessResult {
    /**
     * Toast event - ex, touch when it was tapped by the user
     */
    event: string,

    /**
     * success message
     */
    message: string,

    /**
     * optional data passed in toast options
     */
    data?: any
}


/** This plugin provides access to some native dialog UI elements. */
interface Toast {
    /**
     * Returns an object upon which the methods withMessage, withDuration, withPosition, withAddPixelsY
     * build can be invoked to build a ToastOptions object.
     */
    optionsBuilder(): {
        withMessage(string): ToastOptions;
        withDuration(string): ToastOptions;
        withPosition(string): ToastOptions;
        withAddPixelsY(string): ToastOptions;
        build(): ToastOptions;
    };

    /**
     * Shows the toast message with specific options.
     * @param options Options for displaying the toast message
     * @param successCallback Success callback, that is called when showWithOptions succeeds.
     * @param errorCallback Error callback, that is called when showWithOptions fails.
     */
    showWithOptions(
        options: ToastOptions,
        successCallback?: (result: ToastSuccessResult) => void,
        errorCallback?: (error: any) => void): void;

    /**
     * Shows the toast message.
     * @param message Message to be displayed in te toast
     * @param duration Duration for which the message should be displayed
     * @param position Position where the message should be displayed
     * @param successCallback Success callback, that is called when show succeeds.
     * @param errorCallback Error callback, that is called when show fails.
     */
    show(
        message: string,
        duration: string,
        position: string,
        successCallback?: (result: ToastSuccessResult) => void,
        errorCallback?: (error: any) => void): void;

    /**
     * Shows a toast message for a short duration on the top.
     * @param message Message to be displayed in te toast
     * @param successCallback Success callback, that is called when showShortTop succeeds.
     * @param errorCallback Error callback, that is called when showShortTop fails.
     */
    showShortTop(
        message: string,
        successCallback?: (result: ToastSuccessResult) => void,
        errorCallback?: (error: any) => void): void;

    /**
     * Shows a toast message for a short duration in the center.
     * @param message Message to be displayed in te toast
     * @param successCallback Success callback, that is called when showShortCenter succeeds.
     * @param errorCallback Error callback, that is called when showShortCenter fails.
     */
    showShortCenter(
        message: string,
        successCallback?: (result: ToastSuccessResult) => void,
        errorCallback?: (error: any) => void): void;

    /**
     * Shows a toast message for a short duration on the bottom.
     * @param message Message to be displayed in te toast
     * @param successCallback Success callback, that is called when showShortBottom succeeds.
     * @param errorCallback Error callback, that is called when showShortBottom fails.
     */
    showShortBottom(
        message: string,
        successCallback?: (result: ToastSuccessResult) => void,
        errorCallback?: (error: any) => void): void;

    /**
     * Shows a toast message for a long duration on the top.
     * @param message Message to be displayed in te toast
     * @param successCallback Success callback, that is called when showLongTop succeeds.
     * @param errorCallback Error callback, that is called when showLongTop fails.
     */
    showLongTop(
        message: string,
        successCallback?: (result: ToastSuccessResult) => void,
        errorCallback?: (error: any) => void): void;

    /**
     * Shows a toast message for a long duration on the bottom.
     * @param message Message to be displayed in te toast
     * @param successCallback Success callback, that is called when showLongBottom succeeds.
     * @param errorCallback Error callback, that is called when showLongBottom fails.
     */
    showLongBottom(
        message: string,
        successCallback?: (result: ToastSuccessResult) => void,
        errorCallback?: (error: any) => void): void;

    /**
     * Hides toasts.
     * @param successCallback Success callback, that is called when hide succeeds.
     * @param errorCallback Error callback, that is called when hide fails.
     */
    hide(successCallback?: (result: ToastSuccessResult) => void,
        errorCallback?: (error: any) => void): void;
}

