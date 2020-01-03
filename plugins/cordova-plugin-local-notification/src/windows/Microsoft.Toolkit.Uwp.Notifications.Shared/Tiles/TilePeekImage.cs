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
    /// A peek image that animates in from the top of the Tile.
    /// </summary>
    public sealed class TilePeekImage : IBaseImage
    {
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

        private int? _hintOverlay;

        /// <summary>
        /// New in 1511: A black overlay on the peek image. This value controls the opacity of the black overlay, with 0 being no overlay and 100 being completely black. Defaults to 0.
        /// Previously for RTM: Did not exist, value will be ignored and peek image will be displayed with 0 overlay.
        /// </summary>
        public int? HintOverlay
        {
            get
            {
                return _hintOverlay;
            }

            set
            {
                if (value != null)
                {
                    Element_TileBinding.CheckOverlayValue(value.Value);
                }

                _hintOverlay = value;
            }
        }

        /// <summary>
        /// New in 1511: Control the desired cropping of the image.
        /// Previously for RTM: Did not exist, value will be ignored and peek image will be displayed without any cropping.
        /// </summary>
        public TilePeekImageCrop HintCrop { get; set; }

        internal Element_AdaptiveImage ConvertToElement()
        {
            Element_AdaptiveImage image = BaseImageHelper.CreateBaseElement(this);

            image.Placement = AdaptiveImagePlacement.Peek;
            image.Crop = GetAdaptiveImageCrop();
            image.Overlay = HintOverlay;

            return image;
        }

        private AdaptiveImageCrop GetAdaptiveImageCrop()
        {
            switch (HintCrop)
            {
                case TilePeekImageCrop.Circle:
                    return AdaptiveImageCrop.Circle;

                case TilePeekImageCrop.None:
                    return AdaptiveImageCrop.None;

                default:
                    return AdaptiveImageCrop.Default;
            }
        }
    }
}