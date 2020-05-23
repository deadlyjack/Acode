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
    internal static class TileSizeToAdaptiveTemplateConverter
    {
        public static TileTemplateNameV3 Convert(TileSize size)
        {
            switch (size)
            {
                case TileSize.Small:
                    return TileTemplateNameV3.TileSmall;

                case TileSize.Medium:
                    return TileTemplateNameV3.TileMedium;

                case TileSize.Wide:
                    return TileTemplateNameV3.TileWide;

                case TileSize.Large:
                    return TileTemplateNameV3.TileLarge;

                default:
                    throw new NotImplementedException();
            }
        }
    }
}