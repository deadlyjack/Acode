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

namespace Microsoft.Toolkit.Uwp.Notifications.Adaptive.Elements
{
    [NotificationXmlElement("text")]
    internal sealed class Element_AdaptiveText : IElement_TileBindingChild, IElement_AdaptiveSubgroupChild, IElement_ToastBindingChild
    {
        internal const AdaptiveTextStyle DEFAULT_STYLE = AdaptiveTextStyle.Default;
        internal const AdaptiveTextAlign DEFAULT_ALIGN = AdaptiveTextAlign.Default;
        internal const AdaptiveTextPlacement DEFAULT_PLACEMENT = AdaptiveTextPlacement.Inline;

        [NotificationXmlContent]
        public string Text { get; set; }

        [NotificationXmlAttribute("id")]
        public int? Id { get; set; }

        [NotificationXmlAttribute("lang")]
        public string Lang { get; set; }

        [NotificationXmlAttribute("hint-align", DEFAULT_ALIGN)]
        public AdaptiveTextAlign Align { get; set; } = DEFAULT_ALIGN;

        private int? _maxLines;

        [NotificationXmlAttribute("hint-maxLines")]
        public int? MaxLines
        {
            get
            {
                return _maxLines;
            }

            set
            {
                if (value != null)
                {
                    CheckMaxLinesValue(value.Value);
                }

                _maxLines = value;
            }
        }

        internal static void CheckMaxLinesValue(int value)
        {
            if (value < 1)
            {
                throw new ArgumentOutOfRangeException("MaxLines must be between 1 and int.MaxValue, inclusive.");
            }
        }

        private int? _minLines;

        [NotificationXmlAttribute("hint-minLines")]
        public int? MinLines
        {
            get
            {
                return _minLines;
            }

            set
            {
                if (value != null)
                {
                    CheckMinLinesValue(value.Value);
                }

                _minLines = value;
            }
        }

        internal static void CheckMinLinesValue(int value)
        {
            if (value < 1)
            {
                throw new ArgumentOutOfRangeException("MinLines must be between 1 and int.MaxValue, inclusive.");
            }
        }

        [NotificationXmlAttribute("hint-style", DEFAULT_STYLE)]
        public AdaptiveTextStyle Style { get; set; } = DEFAULT_STYLE;

        [NotificationXmlAttribute("hint-wrap")]
        public bool? Wrap { get; set; }

        [NotificationXmlAttribute("placement", DEFAULT_PLACEMENT)]
        public AdaptiveTextPlacement Placement { get; set; } = DEFAULT_PLACEMENT;
    }
}
