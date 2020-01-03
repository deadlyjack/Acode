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

namespace Microsoft.Toolkit.Uwp.Notifications.Adaptive.Elements
{
    [NotificationXmlElement("progress")]
    internal sealed class Element_AdaptiveProgressBar : IElement_ToastBindingChild
    {
        [NotificationXmlAttribute("value")]
        public string Value { get; set; }

        [NotificationXmlAttribute("title")]
        public string Title { get; set; }

        [NotificationXmlAttribute("valueStringOverride")]
        public string ValueStringOverride { get; set; }

        [NotificationXmlAttribute("status")]
        public string Status { get; set; }
    }
}
