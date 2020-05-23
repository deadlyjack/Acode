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
    // Note that this code is only compiled for WinRT. It is not compiled in any of the other projects.
#if WINRT
    /// <summary>
    /// An enumeration of the properties that support data binding on <see cref="AdaptiveProgressBar"/> .
    /// </summary>
    public enum AdaptiveProgressBarBindableProperty
    {
        /// <summary>
        /// An optional title string
        /// </summary>
        Title,

        /// <summary>
        /// The value of the progress bar.
        /// </summary>
        Value,

        /// <summary>
        /// An optional string to be displayed instead of the default percentage string. If this isn't provided, something like "70%" will be displayed.
        /// </summary>
        ValueStringOverride,

        /// <summary>
        /// An optional status string, which is displayed underneath the progress bar. If provided, this string should reflect the status of the download, like "Downloading..." or "Installing...".
        /// </summary>
        Status
    }
#endif
}
