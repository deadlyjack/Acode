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

namespace Microsoft.Toolkit.Uwp.Notifications
{
    [NotificationXmlElement("image")]
    internal sealed class Element_ToastImage : IElement_ToastBindingChild
    {
        internal const ToastImagePlacement DEFAULT_PLACEMENT = ToastImagePlacement.Inline;
        internal const bool DEFAULT_ADD_IMAGE_QUERY = false;
        internal const ToastImageCrop DEFAULT_CROP = ToastImageCrop.None;

        [NotificationXmlAttribute("src")]
        public string Src { get; set; }

        [NotificationXmlAttribute("alt")]
        public string Alt { get; set; }

        [NotificationXmlAttribute("addImageQuery", DEFAULT_ADD_IMAGE_QUERY)]
        public bool AddImageQuery { get; set; } = DEFAULT_ADD_IMAGE_QUERY;

        [NotificationXmlAttribute("placement", DEFAULT_PLACEMENT)]
        public ToastImagePlacement Placement { get; set; } = DEFAULT_PLACEMENT;

        [NotificationXmlAttribute("hint-crop", DEFAULT_CROP)]
        public ToastImageCrop Crop { get; set; } = DEFAULT_CROP;
    }

    /// <summary>
    /// Specify the desired cropping of the image.
    /// </summary>
    public enum ToastImageCrop
    {
        /// <summary>
        /// Default value. Image is not cropped.
        /// </summary>
        None,

        /// <summary>
        /// Image is cropped to a circle shape.
        /// </summary>
        [EnumString("circle")]
        Circle
    }

    internal enum ToastImagePlacement
    {
        Inline,

        [EnumString("appLogoOverride")]
        AppLogoOverride,

        [EnumString("hero")]
        Hero
    }
}