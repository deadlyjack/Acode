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
    /// A Toast context menu item.
    /// </summary>
    public sealed class ToastContextMenuItem
    {
        /// <summary>
        /// Initializes a Toast context menu item with the required properties.
        /// </summary>
        /// <param name="content">The text to display on the menu item.</param>
        /// <param name="arguments">App-defined string of arguments that the app can later retrieve once it is activated when the user clicks the menu item.</param>
        public ToastContextMenuItem(string content, string arguments)
        {
            if (content == null)
            {
                throw new ArgumentNullException(nameof(content));
            }

            if (arguments == null)
            {
                throw new ArgumentNullException(nameof(arguments));
            }

            Content = content;
            Arguments = arguments;
        }

        /// <summary>
        /// Required. The text to display on the menu item.
        /// </summary>
        public string Content { get; private set; }

        /// <summary>
        /// Required. App-defined string of arguments that the app can later retrieve once it is activated when the user clicks the menu item.
        /// </summary>
        public string Arguments { get; private set; }

        /// <summary>
        /// Controls what type of activation this menu item will use when clicked. Defaults to Foreground.
        /// </summary>
        public ToastActivationType ActivationType { get; set; } = ToastActivationType.Foreground;

        /// <summary>
        /// New in Creators Update: Additional options relating to activation of the toast context menu item.
        /// </summary>
        public ToastActivationOptions ActivationOptions { get; set; }

        internal Element_ToastAction ConvertToElement()
        {
            var el = new Element_ToastAction
            {
                Content = Content,
                Arguments = Arguments,
                ActivationType = Element_Toast.ConvertActivationType(ActivationType),
                Placement = Element_ToastActionPlacement.ContextMenu
            };

            ActivationOptions?.PopulateElement(el);

            return el;
        }
    }
}