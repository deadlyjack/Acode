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
    [NotificationXmlElement("audio")]
    internal sealed class Element_ToastAudio
    {
        internal const bool DEFAULT_LOOP = false;
        internal const bool DEFAULT_SILENT = false;

        /// <summary>
        /// The media file to play in place of the default sound. This can either be a ms-winsoundevent value, or a custom ms-appx:/// or ms-appdata:/// file, or null for the default sound.
        /// </summary>
        [NotificationXmlAttribute("src")]
        public Uri Src { get; set; }

        [NotificationXmlAttribute("loop", DEFAULT_LOOP)]
        public bool Loop { get; set; } = DEFAULT_LOOP;

        /// <summary>
        /// True to mute the sound; false to allow the Toast notification sound to play.
        /// </summary>
        [NotificationXmlAttribute("silent", DEFAULT_SILENT)]
        public bool Silent { get; set; } = DEFAULT_SILENT;
    }
}