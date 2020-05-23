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
    /// A system-handled snooze button that automatically handles snoozing of a Toast notification.
    /// </summary>
    public sealed class ToastButtonSnooze : IToastButton
    {
        /// <summary>
        /// Custom text displayed on the button that overrides the default localized "Snooze" text.
        /// </summary>
        public string CustomContent { get; private set; }

        /// <summary>
        /// An optional image icon for the button to display.
        /// </summary>
        public string ImageUri { get; set; }

        /// <summary>
        /// Optionally specify the ID of an existing <see cref="ToastSelectionBox"/> in order to allow the user to pick a custom snooze time. The ID's of the <see cref="ToastSelectionBoxItem"/>s inside the selection box must represent the snooze interval in minutes. For example, if the user selects an item that has an ID of "120", then the notification will be snoozed for 2 hours. When the user clicks this button, if you specified a SelectionBoxId, the system will parse the ID of the selected item and snooze by that amount of minutes. If you didn't specify a SelectionBoxId, the system will snooze by the default system snooze time.
        /// </summary>
        public string SelectionBoxId { get; set; }

        /// <summary>
        /// Initializes a system-handled snooze button that displays localized "Snooze" text on the button and automatically handles snoozing.
        /// </summary>
        public ToastButtonSnooze()
        {
        }

        /// <summary>
        /// Initializes a system-handled snooze button that displays your text on the button and automatically handles snoozing.
        /// </summary>
        /// <param name="customContent">The text you want displayed on the button.</param>
        public ToastButtonSnooze(string customContent)
        {
            if (customContent == null)
            {
                throw new ArgumentNullException(nameof(customContent));
            }

            CustomContent = customContent;
        }

        internal Element_ToastAction ConvertToElement()
        {
            return new Element_ToastAction()
                       {
                           Content = CustomContent ?? string.Empty, // If not using custom content, we need to provide empty string, otherwise Toast doesn't get displayed
                           Arguments = "snooze",
                           ActivationType = Element_ToastActivationType.System,
                           InputId = SelectionBoxId,
                           ImageUri = ImageUri
                       };
        }
    }
}