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
    /// Phone-only. Supported on Small, Medium, and Wide.
    /// </summary>
    public sealed class TileBindingContentContact : ITileBindingContent
    {
        /// <summary>
        /// The image to display.
        /// </summary>
        public TileBasicImage Image { get; set; }

        /// <summary>
        /// A line of text that is displayed. Not displayed on Small Tile.
        /// </summary>
        public TileBasicText Text { get; set; }

        internal TileTemplateNameV3 GetTemplateName(TileSize size)
        {
            return TileSizeToAdaptiveTemplateConverter.Convert(size);
        }

        internal void PopulateElement(Element_TileBinding binding, TileSize size)
        {
            binding.Presentation = TilePresentation.Contact;

            // Small size doesn't display the text, so no reason to include it in the payload
            if (Text != null && size != TileSize.Small)
            {
                binding.Children.Add(Text.ConvertToElement());
            }

            if (Image != null)
            {
                binding.Children.Add(Image.ConvertToElement());
            }
        }
    }
}