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
    [NotificationXmlElement("selection")]
    internal sealed class Element_ToastSelection : IElement_ToastInputChild
    {
        /// <summary>
        /// The id attribute is required and it is for apps to retrieve back the user selected input after the app is activated.
        /// </summary>
        [NotificationXmlAttribute("id")]
        public string Id { get; set; }

        /// <summary>
        /// The text to display for this selection element.
        /// </summary>
        [NotificationXmlAttribute("content")]
        public string Content { get; set; }
    }
}