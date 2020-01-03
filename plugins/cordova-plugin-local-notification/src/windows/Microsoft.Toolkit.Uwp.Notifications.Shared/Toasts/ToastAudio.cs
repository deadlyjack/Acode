// ******************************************************************
// Copyright (c) Microsoft. All rights reserved.
// This code is licensed under the MIT License (MIT).
// THE CODE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
// THE CODE OR THE USE OR OTHER DEALINGS IN THE CODE.
// ******************************************************************

using System;

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// Specify audio to be played when the Toast notification is received.
    /// </summary>
    public sealed class ToastAudio
    {
        /// <summary>
        /// The media file to play in place of the default sound.
        /// </summary>
        public Uri Src { get; set; }

        /// <summary>
        /// Set to true if the sound should repeat as long as the Toast is shown; false to play only once (default).
        /// </summary>
        public bool Loop { get; set; } = Element_ToastAudio.DEFAULT_LOOP;

        /// <summary>
        /// True to mute the sound; false to allow the Toast notification sound to play (default).
        /// </summary>
        public bool Silent { get; set; } = Element_ToastAudio.DEFAULT_SILENT;

        internal Element_ToastAudio ConvertToElement()
        {
            return new Element_ToastAudio()
            {
                Src = Src,
                Loop = Loop,
                Silent = Silent
            };
        }
    }
}
