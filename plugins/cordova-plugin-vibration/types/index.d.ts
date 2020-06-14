// Type definitions for cordova-plugin-vibration 3.1
// Project: https://github.com/apache/cordova-plugin-vibration
// Definitions by: Microsoft Open Technologies Inc <http://msopentech.com>
//                 Louis Lagrange <https://github.com/Minishlink>
//                 Tim Brust <https://github.com/timbru31>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface Navigator {
    /**
     * Vibrates the device for the specified amount of time.
     *
     * @param time - Milliseconds to vibrate the device. 0 cancels the vibration. Ignored on iOS.
     */
    vibrate(time: number): void;

    /**
     * Vibrates the device with a given pattern.
     *
     * @param time - Sequence of durations (in milliseconds) for which to turn on or off the vibrator. Ignored on iOS.
     */
    vibrate(time: number[]): void;
}
