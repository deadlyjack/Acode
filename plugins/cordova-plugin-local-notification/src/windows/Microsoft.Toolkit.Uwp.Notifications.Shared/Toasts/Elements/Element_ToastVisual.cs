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
    internal sealed class Element_ToastVisual
    {
        internal const bool DEFAULT_ADD_IMAGE_QUERY = false;

        [NotificationXmlAttribute("addImageQuery")]
        public bool? AddImageQuery { get; set; }

        [NotificationXmlAttribute("baseUri")]
        public Uri BaseUri { get; set; }

        [NotificationXmlAttribute("lang")]
        public string Language { get; set; }

        [NotificationXmlAttribute("version")]
        public int? Version { get; set; }

        public IList<Element_ToastBinding> Bindings { get; private set; } = new List<Element_ToastBinding>();
    }
}