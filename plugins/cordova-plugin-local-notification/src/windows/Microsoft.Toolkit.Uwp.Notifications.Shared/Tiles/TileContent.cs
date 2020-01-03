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
using Windows.UI.Notifications;
#endif

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// Base Tile element, which contains a single visual element.
    /// </summary>
    public sealed class TileContent
    {
        /// <summary>
        /// The visual element is required.
        /// </summary>
        public TileVisual Visual { get; set; }

        /// <summary>
        /// Retrieves the notification XML content as a string, so that it can be sent with a HTTP POST in a push notification.
        /// </summary>
        /// <returns>The notification XML content as a string.</returns>
        public string GetContent()
        {
            return ConvertToElement().GetContent();
        }

#if WINDOWS_UWP
        /// <summary>
        /// Retrieves the notification XML content as a WinRT XmlDocument, so that it can be used with a local Tile notification's constructor on either <see cref="TileNotification"/> or <see cref="ScheduledTileNotification"/>.
        /// </summary>
        /// <returns>The notification XML content as a WinRT XmlDocument.</returns>
        public XmlDocument GetXml()
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(GetContent());

            return doc;
        }
#endif

        internal Element_Tile ConvertToElement()
        {
            var tile = new Element_Tile();

            if (Visual != null)
            {
                tile.Visual = Visual.ConvertToElement();
            }

            return tile;
        }
    }
}