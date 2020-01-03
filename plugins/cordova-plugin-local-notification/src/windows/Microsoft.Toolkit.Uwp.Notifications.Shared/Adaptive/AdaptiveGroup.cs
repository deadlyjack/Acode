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
using Microsoft.Toolkit.Uwp.Notifications.Adaptive.Elements;

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// Groups semantically identify that the content in the group must either be displayed as a whole, or not displayed if it cannot fit. Groups also allow creating multiple columns. Supported on Tiles since RTM. Supported on Toasts since Anniversary Update.
    /// </summary>
    public sealed class AdaptiveGroup : ITileBindingContentAdaptiveChild, IAdaptiveChild, IToastBindingGenericChild
    {
        /// <summary>
        /// The only valid children of groups are <see cref="AdaptiveSubgroup"/>. Each subgroup is displayed as a separate vertical column. Note that you must include at least one subgroup in your group, otherwise an <see cref="InvalidOperationException"/> will be thrown when you try to retrieve the XML for the notification.
        /// </summary>
        public IList<AdaptiveSubgroup> Children { get; private set; } = new List<AdaptiveSubgroup>();

        internal Element_AdaptiveGroup ConvertToElement()
        {
            if (Children.Count == 0)
            {
                throw new InvalidOperationException("Groups must have at least one child subgroup. The Children property had zero items in it.");
            }

            Element_AdaptiveGroup group = new Element_AdaptiveGroup();

            foreach (var subgroup in Children)
            {
                group.Children.Add(subgroup.ConvertToElement());
            }

            return group;
        }
    }
}
