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

namespace Microsoft.Toolkit.Uwp.Notifications.Adaptive.Elements
{
    [NotificationXmlElement("image")]
    internal sealed class Element_AdaptiveImage : IElement_TileBindingChild, IElement_ToastBindingChild, IElement_AdaptiveSubgroupChild
    {
        internal const AdaptiveImagePlacement DEFAULT_PLACEMENT = AdaptiveImagePlacement.Inline;
        internal const AdaptiveImageCrop DEFAULT_CROP = AdaptiveImageCrop.Default;
        internal const AdaptiveImageAlign DEFAULT_ALIGN = AdaptiveImageAlign.Default;

        [NotificationXmlAttribute("id")]
        public int? Id { get; set; }

        [NotificationXmlAttribute("src")]
        public string Src { get; set; }

        [NotificationXmlAttribute("alt")]
        public string Alt { get; set; }

        [NotificationXmlAttribute("addImageQuery")]
        public bool? AddImageQuery { get; set; }

        [NotificationXmlAttribute("placement", DEFAULT_PLACEMENT)]
        public AdaptiveImagePlacement Placement { get; set; } = DEFAULT_PLACEMENT;

        [NotificationXmlAttribute("hint-align", DEFAULT_ALIGN)]
        public AdaptiveImageAlign Align { get; set; } = DEFAULT_ALIGN;

        [NotificationXmlAttribute("hint-crop", DEFAULT_CROP)]
        public AdaptiveImageCrop Crop { get; set; } = DEFAULT_CROP;

        [NotificationXmlAttribute("hint-removeMargin")]
        public bool? RemoveMargin { get; set; }

        private int? _overlay;

        [NotificationXmlAttribute("hint-overlay")]
        public int? Overlay
        {
            get
            {
                return _overlay;
            }

            set
            {
                if (value != null)
                {
                    Element_TileBinding.CheckOverlayValue(value.Value);
                }

                _overlay = value;
            }
        }
    }
}
