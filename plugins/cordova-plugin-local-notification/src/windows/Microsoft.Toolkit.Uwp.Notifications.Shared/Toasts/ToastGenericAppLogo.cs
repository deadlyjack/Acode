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

using Microsoft.Toolkit.Uwp.Notifications.Adaptive.Elements;

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// The logo that is displayed on your Toast notification.
    /// </summary>
    public sealed class ToastGenericAppLogo : IBaseImage
    {
        /// <summary>
        /// Initializes a logo that is displayed on your Toast notification.
        /// </summary>
        public ToastGenericAppLogo()
        {
        }

        private string _source;

        /// <summary>
        /// The URI of the image. Can be from your application package, application data, or the internet. Internet images must be less than 200 KB in size.
        /// </summary>
        public string Source
        {
            get { return _source; }
            set { BaseImageHelper.SetSource(ref _source, value); }
        }

        /// <summary>
        /// A description of the image, for users of assistive technologies.
        /// </summary>
        public string AlternateText { get; set; }

        /// <summary>
        /// Set to true to allow Windows to append a query string to the image URI supplied in the Tile notification. Use this attribute if your server hosts images and can handle query strings, either by retrieving an image variant based on the query strings or by ignoring the query string and returning the image as specified without the query string. This query string specifies scale, contrast setting, and language.
        /// </summary>
        public bool? AddImageQuery { get; set; }

        /// <summary>
        /// Specify how you would like the image to be cropped.
        /// </summary>
        public ToastGenericAppLogoCrop HintCrop { get; set; }

        internal Element_AdaptiveImage ConvertToElement()
        {
            Element_AdaptiveImage el = BaseImageHelper.CreateBaseElement(this);

            el.Placement = AdaptiveImagePlacement.AppLogoOverride;
            el.Crop = GetAdaptiveImageCrop();

            return el;
        }

        private AdaptiveImageCrop GetAdaptiveImageCrop()
        {
            switch (HintCrop)
            {
                case ToastGenericAppLogoCrop.Circle:
                    return AdaptiveImageCrop.Circle;

                case ToastGenericAppLogoCrop.None:
                    return AdaptiveImageCrop.None;

                default:
                    return AdaptiveImageCrop.Default;
            }
        }
    }
}