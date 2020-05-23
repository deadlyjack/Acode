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

namespace Microsoft.Toolkit.Uwp.Notifications.Adaptive.Elements
{
    [NotificationXmlElement("subgroup")]
    internal sealed class Element_AdaptiveSubgroup : IElementWithDescendants
    {
        internal const AdaptiveSubgroupTextStacking DEFAULT_TEXT_STACKING = AdaptiveSubgroupTextStacking.Default;

        [NotificationXmlAttribute("hint-textStacking", DEFAULT_TEXT_STACKING)]
        public AdaptiveSubgroupTextStacking TextStacking { get; set; } = DEFAULT_TEXT_STACKING;

        private int? _weight;

        [NotificationXmlAttribute("hint-weight")]
        public int? Weight
        {
            get
            {
                return _weight;
            }

            set
            {
                CheckWeight(value);

                _weight = value;
            }
        }

        internal static void CheckWeight(int? weight)
        {
            if (weight != null && weight.Value < 1)
            {
                throw new ArgumentOutOfRangeException("Weight must be between 1 and int.MaxValue, inclusive (or null)");
            }
        }

        public IList<IElement_AdaptiveSubgroupChild> Children { get; private set; } = new List<IElement_AdaptiveSubgroupChild>();

        public IEnumerable<object> Descendants()
        {
            foreach (IElement_AdaptiveSubgroupChild child in Children)
            {
                // Return each child (we know there's no further descendants)
                yield return child;
            }
        }
    }

    internal interface IElement_AdaptiveSubgroupChild
    {
    }
}
