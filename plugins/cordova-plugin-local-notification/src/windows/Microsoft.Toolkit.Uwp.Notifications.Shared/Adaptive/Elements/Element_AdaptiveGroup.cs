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

using System.Collections.Generic;

namespace Microsoft.Toolkit.Uwp.Notifications.Adaptive.Elements
{
    [NotificationXmlElement("group")]
    internal sealed class Element_AdaptiveGroup : IElement_TileBindingChild, IElement_ToastBindingChild, IElementWithDescendants
    {
        public IList<Element_AdaptiveSubgroup> Children { get; private set; } = new List<Element_AdaptiveSubgroup>();

        public IEnumerable<object> Descendants()
        {
            foreach (Element_AdaptiveSubgroup subgroup in Children)
            {
                // Return the subgroup
                yield return subgroup;

                // And also return its descendants
                foreach (object descendant in subgroup.Descendants())
                {
                    yield return descendant;
                }
            }
        }
    }
}
