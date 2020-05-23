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
    /// A button that, when clicked, is interpreted as a "dismiss" by the system, and the Toast is dismissed just like if the user swiped the Toast away.
    /// </summary>
    public sealed class ToastButtonDismiss : IToastButton
    {
        /// <summary>
        /// Custom text displayed on the button that overrides the default localized "Dismiss" text.
        /// </summary>
        public string CustomContent { get; private set; }

        /// <summary>
        /// An optional image icon for the button to display.
        /// </summary>
        public string ImageUri { get; set; }

        /// <summary>
        /// Initializes a system-handled dismiss button that displays localized "Dismiss" text on the button.
        /// </summary>
        public ToastButtonDismiss()
        {
        }

        /// <summary>
        /// Constructs a system-handled dismiss button that displays your text on the button.
        /// </summary>
        /// <param name="customContent">The text you want displayed on the button.</param>
        public ToastButtonDismiss(string customContent)
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
                           Content = this.CustomContent == null ? string.Empty : this.CustomContent, // If not using custom content, we need to provide empty string, otherwise Toast doesn't get displayed
                           Arguments = "dismiss",
                           ActivationType = Element_ToastActivationType.System,
                           ImageUri = ImageUri

                           // InputId is useless since dismiss button can't be placed to the right of text box (shell doesn't display it)
                       };
        }
    }
}