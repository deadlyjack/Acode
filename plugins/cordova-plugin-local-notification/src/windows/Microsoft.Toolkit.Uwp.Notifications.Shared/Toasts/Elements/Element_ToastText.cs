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

namespace Microsoft.Toolkit.Uwp.Notifications
{
    [NotificationXmlElement("text")]
    internal sealed class Element_ToastText : IElement_ToastBindingChild
    {
        internal const ToastTextPlacement DEFAULT_PLACEMENT = ToastTextPlacement.Inline;

        [NotificationXmlContent]
        public string Text { get; set; }

        [NotificationXmlAttribute("lang")]
        public string Lang { get; set; }

        [NotificationXmlAttribute("placement", DEFAULT_PLACEMENT)]
        public ToastTextPlacement Placement { get; set; } = DEFAULT_PLACEMENT;
    }

    internal enum ToastTextPlacement
    {
        Inline,

        [EnumString("attribution")]
        Attribution
    }
}