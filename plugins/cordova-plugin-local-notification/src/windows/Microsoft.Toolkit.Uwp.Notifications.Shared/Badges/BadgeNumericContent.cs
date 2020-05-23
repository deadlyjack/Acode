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

#if WINDOWS_UWP
using Windows.Data.Xml.Dom;
#endif

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// Notification content object to display a number on a Tile's badge.
    /// </summary>
    public sealed class BadgeNumericContent : INotificationContent
    {
        /// <summary>
        /// Default constructor to create a numeric badge content object.
        /// </summary>
        public BadgeNumericContent()
        {
        }

        /// <summary>
        /// Constructor to create a numeric badge content object with a number.
        /// </summary>
        /// <param name="number">
        /// The number that will appear on the badge.  If the number is 0, the badge
        /// will be removed.
        /// </param>
        public BadgeNumericContent(uint number)
        {
            _number = number;
        }

        /// <summary>
        /// The number that will appear on the badge.  If the number is 0, the badge
        /// will be removed.
        /// </summary>
        public uint Number
        {
            get { return _number; }
            set { _number = value; }
        }

        /// <summary>
        /// Retrieves the notification Xml content as a string.
        /// </summary>
        /// <returns>The notification Xml content as a string.</returns>
        public string GetContent()
        {
            return string.Format("<badge value='{0}'/>", _number);
        }

        /// <summary>
        /// Retrieves the notification Xml content as a string.
        /// </summary>
        /// <returns>The notification Xml content as a string.</returns>
        public override string ToString()
        {
            return GetContent();
        }

#if WINDOWS_UWP
    /// <summary>
    /// Retrieves the notification Xml content as a WinRT Xml document.
    /// </summary>
    /// <returns>The notification Xml content as a WinRT Xml document.</returns>
        public XmlDocument GetXml()
        {
            XmlDocument xml = new XmlDocument();
            xml.LoadXml(GetContent());
            return xml;
        }
#endif

        private uint _number = 0;
    }
}