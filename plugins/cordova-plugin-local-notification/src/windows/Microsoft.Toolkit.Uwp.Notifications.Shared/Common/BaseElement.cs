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

using System.IO;
using System.Text;

#if WINDOWS_UWP
using Windows.Data.Xml.Dom;
#endif

namespace Microsoft.Toolkit.Uwp.Notifications
{
    internal abstract class BaseElement
    {
        /// <summary>
        /// Retrieves the notification XML content as a string.
        /// </summary>
        /// <returns>The notification XML content as a string.</returns>
        public string GetContent()
        {
            using (MemoryStream stream = new MemoryStream())
            {
                using (System.Xml.XmlWriter writer = System.Xml.XmlWriter.Create(stream, new System.Xml.XmlWriterSettings()
                {
                    Encoding = Encoding.UTF8, // Use UTF-8 encoding to save space (it defaults to UTF-16 which is 2x the size)
                    Indent = false,
                    NewLineOnAttributes = false
                }))
                {
                    XmlWriterHelper.Write(writer, this);
                }

                stream.Position = 0;

                using (StreamReader reader = new StreamReader(stream))
                {
                    return reader.ReadToEnd();
                }
            }
        }

#if WINDOWS_UWP
        /// <summary>
        /// Retrieves the notification XML content as a WinRT XML document.
        /// </summary>
        /// <returns>The notification XML content as a WinRT XML document.</returns>
        public XmlDocument GetXml()
        {
            XmlDocument xml = new XmlDocument();
            xml.LoadXml(GetContent());
            return xml;
        }
#endif
    }
}