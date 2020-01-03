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
using Microsoft.Toolkit.Uwp.Notifications.Adaptive;

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// Generic Toast binding, where you provide text, images, and other visual elements for your Toast notification.
    /// </summary>
    public sealed class ToastBindingGeneric
    {
        /// <summary>
        /// The contents of the body of the Toast, which can include <see cref="AdaptiveText"/>, <see cref="AdaptiveImage"/>, and <see cref="AdaptiveGroup"/> (added in Anniversary Update). Also, <see cref="AdaptiveText"/> elements must come before any other elements. If an <see cref="AdaptiveText"/> element is placed after any other element, an exception will be thrown when you try to retrieve the Toast XML content. And finally, certain <see cref="AdaptiveText"/> properties like HintStyle aren't supported on the root children text elements, and only work inside an <see cref="AdaptiveGroup"/>. If you use <see cref="AdaptiveGroup"/> on devices without the Anniversary Update, the group content will simply be dropped.
        /// </summary>
        public IList<IToastBindingGenericChild> Children { get; private set; } = new List<IToastBindingGenericChild>();

        /// <summary>
        /// An optional override of the logo displayed on the Toast notification.
        /// </summary>
        public ToastGenericAppLogo AppLogoOverride { get; set; }

        /// <summary>
        /// New in Anniversary Update: An optional hero image (a visually impactful image displayed on the Toast notification). On devices without the Anniversary Update, the hero image will simply be ignored.
        /// </summary>
        public ToastGenericHeroImage HeroImage { get; set; }

        /// <summary>
        /// New in Anniversary Update: An optional text element that is displayed as attribution text. On devices without the Anniversary Update, this text will appear as if it's another <see cref="AdaptiveText"/> element at the end of your Children list.
        /// </summary>
        public ToastGenericAttributionText Attribution { get; set; }

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

        internal Element_ToastBinding ConvertToElement()
        {
            Element_ToastBinding binding = new Element_ToastBinding(ToastTemplateType.ToastGeneric)
            {
                BaseUri = BaseUri,
                AddImageQuery = AddImageQuery,
                Language = Language
            };

            // Add children
            foreach (var child in Children)
            {
                var el = (IElement_ToastBindingChild)AdaptiveHelper.ConvertToElement(child);
                binding.Children.Add(el);
            }

            // Add attribution
            if (Attribution != null)
            {
                binding.Children.Add(Attribution.ConvertToElement());
            }

            // If there's hero, add it
            if (HeroImage != null)
            {
                binding.Children.Add(HeroImage.ConvertToElement());
            }

            // If there's app logo, add it
            if (AppLogoOverride != null)
            {
                binding.Children.Add(AppLogoOverride.ConvertToElement());
            }

            return binding;
        }
    }
}
