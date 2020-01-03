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
    /// The form that the Tile should use to display the app's brand.
    /// </summary>
    public enum TileBranding
    {
        /// <summary>
        /// The default choice. If ShowNameOn___ is true for the Tile size being displayed, then branding will be "Name". Otherwise it will be "None".
        /// </summary>
        Auto,

        /// <summary>
        /// No branding will be displayed.
        /// </summary>
        [EnumString("none")]
        None,

        /// <summary>
        /// The DisplayName will be shown.
        /// </summary>
        [EnumString("name")]
        Name,

        /// <summary>
        /// Desktop-only. The Square44x44Logo will be shown. On Mobile, this will fallback to Name.
        /// </summary>
        [EnumString("logo")]
        Logo,

        /// <summary>
        /// Desktop-only. Both the DisplayName and Square44x44Logo will be shown. On Mobile, this will fallback to Name.
        /// </summary>
        [EnumString("nameAndLogo")]
        NameAndLogo
    }
}