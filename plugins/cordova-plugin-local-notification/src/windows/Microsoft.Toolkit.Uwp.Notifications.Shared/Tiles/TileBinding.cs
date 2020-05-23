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
    /// The binding element contains the visual content for a specific Tile size.
    /// </summary>
    public sealed class TileBinding
    {
        /// <summary>
        /// The target locale of the XML payload, specified as a BCP-47 language tags such as "en-US" or "fr-FR". The locale specified here overrides that in visual, but can be overriden by that in text. If this value is a literal string, this attribute defaults to the user's UI language. If this value is a string reference, this attribute defaults to the locale chosen by Windows Runtime in resolving the string. See Remarks for when this value isn't specified.
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// A default base URI that is combined with relative URIs in image source attributes. Defaults to null.
        /// </summary>
        public Uri BaseUri { get; set; }

        /// <summary>
        /// The form that the Tile should use to display the app's brand..
        /// </summary>
        public TileBranding Branding { get; set; } = Element_TileBinding.DEFAULT_BRANDING;

        /// <summary>
        /// Defaults to false. Set to true to allow Windows to append a query string to the image URI supplied in the Tile notification. Use this attribute if your server hosts images and can handle query strings, either by retrieving an image variant based on the query strings or by ignoring the query string and returning the image as specified without the query string. This query string specifies scale, contrast setting, and language; for instance, a value of
        ///
        /// "www.website.com/images/hello.png"
        ///
        /// included in the notification becomes
        ///
        /// "www.website.com/images/hello.png?ms-scale=100&amp;ms-contrast=standard&amp;ms-lang=en-us"
        /// </summary>
        public bool? AddImageQuery { get; set; }

        /// <summary>
        /// Set to a sender-defined string that uniquely identifies the content of the notification. This prevents duplicates in the situation where a large Tile template is displaying the last three wide Tile notifications.
        /// </summary>
        public string ContentId { get; set; }

        /// <summary>
        /// An optional string to override the Tile's display name while showing this notification.
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// New in Anniversary Update: App-defined data that is passed back to your app via the TileActivatedInfo property on LaunchActivatedEventArgs when the user launches your app from the Live Tile. This allows you to know which Tile notifications your user saw when they tapped your Live Tile. On devices without the Anniversary Update, this will simply be ignored.
        /// </summary>
        public string Arguments { get; set; }

        /// <summary>
        /// The actual content to be displayed. One of <see cref="TileBindingContentAdaptive"/>, <see cref="TileBindingContentIconic"/>, <see cref="TileBindingContentContact"/>, <see cref="TileBindingContentPeople"/>, or <see cref="TileBindingContentPhotos"/>
        /// </summary>
        public ITileBindingContent Content { get; set; }

        internal Element_TileBinding ConvertToElement(TileSize size)
        {
            TileTemplateNameV3 templateName = GetTemplateName(Content, size);

            Element_TileBinding binding = new Element_TileBinding(templateName)
            {
                Language = Language,
                BaseUri = BaseUri,
                Branding = Branding,
                AddImageQuery = AddImageQuery,
                DisplayName = DisplayName,
                ContentId = ContentId,
                Arguments = Arguments

                // LockDetailedStatus gets populated by TileVisual
            };

            PopulateElement(Content, binding, size);

            return binding;
        }

        private static void PopulateElement(ITileBindingContent bindingContent, Element_TileBinding binding, TileSize size)
        {
            if (bindingContent == null)
            {
                return;
            }

            if (bindingContent is TileBindingContentAdaptive)
            {
                (bindingContent as TileBindingContentAdaptive).PopulateElement(binding, size);
            }
            else if (bindingContent is TileBindingContentContact)
            {
                (bindingContent as TileBindingContentContact).PopulateElement(binding, size);
            }
            else if (bindingContent is TileBindingContentIconic)
            {
                (bindingContent as TileBindingContentIconic).PopulateElement(binding, size);
            }
            else if (bindingContent is TileBindingContentPeople)
            {
                (bindingContent as TileBindingContentPeople).PopulateElement(binding, size);
            }
            else if (bindingContent is TileBindingContentPhotos)
            {
                (bindingContent as TileBindingContentPhotos).PopulateElement(binding, size);
            }
            else
            {
                throw new NotImplementedException("Unknown binding content type: " + bindingContent.GetType());
            }
        }

        private static TileTemplateNameV3 GetTemplateName(ITileBindingContent bindingContent, TileSize size)
        {
            if (bindingContent == null)
            {
                return TileSizeToAdaptiveTemplateConverter.Convert(size);
            }

            if (bindingContent is TileBindingContentAdaptive)
            {
                return (bindingContent as TileBindingContentAdaptive).GetTemplateName(size);
            }

            if (bindingContent is TileBindingContentContact)
            {
                return (bindingContent as TileBindingContentContact).GetTemplateName(size);
            }

            if (bindingContent is TileBindingContentIconic)
            {
                return (bindingContent as TileBindingContentIconic).GetTemplateName(size);
            }

            if (bindingContent is TileBindingContentPeople)
            {
                return (bindingContent as TileBindingContentPeople).GetTemplateName(size);
            }

            if (bindingContent is TileBindingContentPhotos)
            {
                return (bindingContent as TileBindingContentPhotos).GetTemplateName(size);
            }

            throw new NotImplementedException("Unknown binding content type: " + bindingContent.GetType());
        }
    }

    /// <summary>
    /// Visual Tile content. One of <see cref="TileBindingContentAdaptive"/>, <see cref="TileBindingContentIconic"/>, <see cref="TileBindingContentPhotos"/>, <see cref="TileBindingContentPeople"/>, or <see cref="TileBindingContentContact"/>.
    /// </summary>
    public interface ITileBindingContent
    {
    }

    internal enum TileTemplate
    {
        TileSmall,
        TileMedium,
        TileWide,
        TileLarge
    }
}
