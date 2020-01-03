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

namespace Microsoft.Toolkit.Uwp.Notifications
{
    [NotificationXmlElement("visual")]
    internal sealed class Element_TileVisual
    {
        internal const TileBranding DEFAULT_BRANDING = TileBranding.Auto;
        internal const bool DEFAULT_ADD_IMAGE_QUERY = false;

        [NotificationXmlAttribute("addImageQuery")]
        public bool? AddImageQuery { get; set; }

        [NotificationXmlAttribute("baseUri")]
        public Uri BaseUri { get; set; }

        [NotificationXmlAttribute("branding", DEFAULT_BRANDING)]
        public TileBranding Branding { get; set; } = DEFAULT_BRANDING;

        [NotificationXmlAttribute("contentId")]
        public string ContentId { get; set; }

        [NotificationXmlAttribute("displayName")]
        public string DisplayName { get; set; }

        [NotificationXmlAttribute("lang")]
        public string Language { get; set; }

        [NotificationXmlAttribute("arguments")]
        public string Arguments { get; set; }

        public IList<Element_TileBinding> Bindings { get; private set; } = new List<Element_TileBinding>();
    }
}