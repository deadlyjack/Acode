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

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// Defines the visual aspects of a Toast notification.
    /// </summary>
    public sealed class ToastVisual
    {
        /// <summary>
        /// The target locale of the XML payload, specified as BCP-47 language tags such as "en-US" or "fr-FR". This locale is overridden by any locale specified in binding or text. If this value is a literal string, this attribute defaults to the user's UI language. If this value is a string reference, this attribute defaults to the locale chosen by Windows Runtime in resolving the string.
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// A default base URI that is combined with relative URIs in image source attributes.
        /// </summary>
        public Uri BaseUri { get; set; }

        /// <summary>
        /// Set to "true" to allow Windows to append a query string to the image URI supplied in the Toast notification. Use this attribute if your server hosts images and can handle query strings, either by retrieving an image variant based on the query strings or by ignoring the query string and returning the image as specified without the query string. This query string specifies scale, contrast setting, and language.
        /// </summary>
        public bool? AddImageQuery { get; set; }

        /// <summary>
        /// The generic Toast binding, which can be rendered on all devices. This binding is required and cannot be null.
        /// </summary>
        public ToastBindingGeneric BindingGeneric { get; set; }

        internal Element_ToastVisual ConvertToElement()
        {
            var visual = new Element_ToastVisual()
            {
                Language = Language,
                BaseUri = BaseUri,
                AddImageQuery = AddImageQuery
            };

            Element_ToastBinding binding = BindingGeneric.ConvertToElement();

            // TODO: If a BaseUri wasn't provided, we can potentially optimize the payload size by calculating the best BaseUri
            visual.Bindings.Add(binding);

            return visual;
        }
    }
}