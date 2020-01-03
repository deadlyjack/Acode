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
    /// <summary>
    /// Specifies the horizontal alignment for an image.
    /// </summary>
    public enum AdaptiveImageAlign
    {
        /// <summary>
        /// Default value, alignment behavior determined by renderer.
        /// </summary>
        Default,

        /// <summary>
        /// Image stretches to fill available width (and potentially available height too, depending on where the image is).
        /// </summary>
        [EnumString("stretch")]
        Stretch,

        /// <summary>
        /// Align the image to the left, displaying the image at its native resolution.
        /// </summary>
        [EnumString("left")]
        Left,

        /// <summary>
        /// Align the image in the center horizontally, displaying the image at its native resolution.
        /// </summary>
        [EnumString("center")]
        Center,

        /// <summary>
        /// Align the image to the right, displaying the image at its native resolution.
        /// </summary>
        [EnumString("right")]
        Right
    }

    /// <summary>
    /// Specify the desired cropping of the image.
    /// </summary>
    public enum AdaptiveImageCrop
    {
        /// <summary>
        /// Default value, cropping behavior determined by renderer.
        /// </summary>
        Default,

        /// <summary>
        /// Image is not cropped.
        /// </summary>
        [EnumString("none")]
        None,

        /// <summary>
        /// Image is cropped to a circle shape.
        /// </summary>
        [EnumString("circle")]
        Circle
    }
}
