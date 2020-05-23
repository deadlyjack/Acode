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
    /// Subgroups are vertical columns that can contain text and images. Supported on Tiles since RTM. Supported on Toasts since Anniversary Update.
    /// </summary>
    public sealed class AdaptiveSubgroup
    {
        /// <summary>
        /// <see cref="AdaptiveText"/> and <see cref="AdaptiveImage"/> are valid children of subgroups.
        /// </summary>
        public IList<IAdaptiveSubgroupChild> Children { get; private set; } = new List<IAdaptiveSubgroupChild>();

        private int? _hintWeight;

        /// <summary>
        /// Control the width of this subgroup column by specifying the weight, relative to the other subgroups.
        /// </summary>
        public int? HintWeight
        {
            get
            {
                return _hintWeight;
            }

            set
            {
                Element_AdaptiveSubgroup.CheckWeight(value);

                _hintWeight = value;
            }
        }

        /// <summary>
        /// Control the vertical alignment of this subgroup's content.
        /// </summary>
        public AdaptiveSubgroupTextStacking HintTextStacking { get; set; } = Element_AdaptiveSubgroup.DEFAULT_TEXT_STACKING;

        internal Element_AdaptiveSubgroup ConvertToElement()
        {
            var subgroup = new Element_AdaptiveSubgroup()
            {
                Weight = HintWeight,
                TextStacking = HintTextStacking
            };

            foreach (var child in Children)
            {
                subgroup.Children.Add(ConvertToSubgroupChildElement(child));
            }

            return subgroup;
        }

        private static IElement_AdaptiveSubgroupChild ConvertToSubgroupChildElement(IAdaptiveSubgroupChild child)
        {
            if (child is AdaptiveText)
            {
                return (child as AdaptiveText).ConvertToElement();
            }

            if (child is AdaptiveImage)
            {
                return (child as AdaptiveImage).ConvertToElement();
            }

            throw new NotImplementedException("Unknown child: " + child.GetType());
        }
    }
}
