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

namespace Microsoft.Toolkit.Uwp.Notifications
{
    [NotificationXmlElement("input")]
    internal sealed class Element_ToastInput : IElement_ToastActionsChild
    {
        /// <summary>
        /// The id attribute is required and is for developers to retrieve user inputs once the app is activated (in the foreground or background).
        /// </summary>
        [NotificationXmlAttribute("id")]
        public string Id { get; set; }

        [NotificationXmlAttribute("type")]
        public ToastInputType Type { get; set; }

        /// <summary>
        /// The title attribute is optional and is for developers to specify a title for the input for shells to render when there is affordance.
        /// </summary>
        [NotificationXmlAttribute("title")]
        public string Title { get; set; }

        /// <summary>
        /// The placeholderContent attribute is optional and is the grey-out hint text for text input type. This attribute is ignored when the input type is not �text�.
        /// </summary>
        [NotificationXmlAttribute("placeHolderContent")]
        public string PlaceholderContent { get; set; }

        /// <summary>
        /// The defaultInput attribute is optional and it allows developer to provide a default input value.
        /// </summary>
        [NotificationXmlAttribute("defaultInput")]
        public string DefaultInput { get; set; }

        public IList<IElement_ToastInputChild> Children { get; private set; } = new List<IElement_ToastInputChild>();
    }

    internal interface IElement_ToastInputChild
    {
    }

    internal enum ToastInputType
    {
        [EnumString("text")]
        Text,

        [EnumString("selection")]
        Selection
    }
}