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
using System.Collections.Generic;

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// Automatically constructs a selection box for snooze intervals, and snooze/dismiss buttons, all automatically localized, and snoozing logic is automatically handled by the system.
    /// </summary>
    public sealed class ToastActionsSnoozeAndDismiss : IToastActions
    {
        /// <summary>
        /// New in Anniversary Update: Custom context menu items, providing additional actions when the user right clicks the Toast notification. You can only have up to 5 items.
        /// </summary>
        public IList<ToastContextMenuItem> ContextMenuItems { get; private set; } = new List<ToastContextMenuItem>();

        internal Element_ToastActions ConvertToElement()
        {
            if (ContextMenuItems.Count > 5)
            {
                throw new InvalidOperationException("You have too many context menu items. You can only have up to 5.");
            }

            var el = new Element_ToastActions()
            {
                SystemCommands = ToastSystemCommand.SnoozeAndDismiss
            };

            foreach (var item in ContextMenuItems)
            {
                el.Children.Add(item.ConvertToElement());
            }

            return el;
        }
    }
}