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

using System.Collections.Generic;

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// New in 1511: Supported on Medium, Wide, and Large (Desktop and Mobile).
    /// Previously for RTM: Phone-only. Supported on Medium and Wide.
    /// </summary>
    public sealed class TileBindingContentPeople : ITileBindingContent
    {
        /// <summary>
        /// Images that will roll around as circles.
        /// </summary>
        public IList<TileBasicImage> Images { get; private set; } = new List<TileBasicImage>();

        internal TileTemplateNameV3 GetTemplateName(TileSize size)
        {
            return TileSizeToAdaptiveTemplateConverter.Convert(size);
        }

        internal void PopulateElement(Element_TileBinding binding, TileSize size)
        {
            binding.Presentation = TilePresentation.People;

            foreach (var img in Images)
            {
                binding.Children.Add(img.ConvertToElement());
            }
        }
    }
}