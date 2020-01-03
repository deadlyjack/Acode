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

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// The types of glyphs that can be placed on a badge.
    /// </summary>
    public enum BadgeGlyphValue
    {
        /// <summary>
        /// No glyph.  If there is a numeric badge, or a glyph currently on the badge,
        /// it will be removed.
        /// </summary>
        None = 0,

        /// <summary>
        /// A glyph representing application activity.
        /// </summary>
        Activity,

        /// <summary>
        /// A glyph representing an alert.
        /// </summary>
        Alert,

        /// <summary>
        /// A glyph representing an alarm.
        /// </summary>
        Alarm,

        /// <summary>
        /// A glyph representing availability status.
        /// </summary>
        Available,

        /// <summary>
        /// A glyph representing away status
        /// </summary>
        Away,

        /// <summary>
        /// A glyph representing busy status.
        /// </summary>
        Busy,

        /// <summary>
        /// A glyph representing that a new message is available.
        /// </summary>
        NewMessage,

        /// <summary>
        /// A glyph representing that media is paused.
        /// </summary>
        Paused,

        /// <summary>
        /// A glyph representing that media is playing.
        /// </summary>
        Playing,

        /// <summary>
        /// A glyph representing unavailable status.
        /// </summary>
        Unavailable,

        /// <summary>
        /// A glyph representing an error.
        /// </summary>
        Error,

        /// <summary>
        /// A glyph representing attention status.
        /// </summary>
        Attention
    }
}
