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
    /// A selection box control, which lets users pick from a dropdown list of options.
    /// </summary>
    public sealed class ToastSelectionBox : IToastInput
    {
        /// <summary>
        /// Initializes a new Toast SelectionBox input control with the required elements.
        /// </summary>
        /// <param name="id">Developer-provided ID that the developer uses later to retrieve input when the Toast is interacted with.</param>
        public ToastSelectionBox(string id)
        {
            if (id == null)
            {
                throw new ArgumentNullException(nameof(id));
            }

            Id = id;
        }

        /// <summary>
        /// The ID property is required, and is used so that developers can retrieve user input once the app is activated.
        /// </summary>
        public string Id { get; private set; }

        /// <summary>
        /// Title text to display above the SelectionBox.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// This controls which item is selected by default, and refers to the Id property of <see cref="ToastSelectionBoxItem"/>. If you do not provide this, the default selection will be empty (user sees nothing).
        /// </summary>
        public string DefaultSelectionBoxItemId { get; set; }

        /// <summary>
        /// The selection items that the user can pick from in this SelectionBox. Only 5 items can be added.
        /// </summary>
        public IList<ToastSelectionBoxItem> Items { get; private set; } = new LimitedList<ToastSelectionBoxItem>(5);

        internal Element_ToastInput ConvertToElement()
        {
            var input = new Element_ToastInput()
            {
                Type = ToastInputType.Selection,
                Id = Id,
                DefaultInput = DefaultSelectionBoxItemId,
                Title = Title
            };

            foreach (var item in Items)
            {
                input.Children.Add(item.ConvertToElement());
            }

            return input;
        }
    }
}