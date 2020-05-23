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
    /// <summary>
    /// A class that represents the progress bar's value.
    /// </summary>
    public sealed class AdaptiveProgressBarValue
    {
        /// <summary>
        /// Gets or sets the value (0-1) representing the percent complete.
        /// </summary>
        public double Value { get; set; }

        /// <summary>
        /// Gets or sets whether the progress bar is indeterminate.
        /// </summary>
        public bool IsIndeterminate { get; set; }

        /// <summary>
        /// Private constructor
        /// </summary>
        private AdaptiveProgressBarValue()
        {
        }

        internal string ToXmlString()
        {
            if (IsIndeterminate)
            {
                return "indeterminate";
            }

            return Value.ToString();
        }

        /// <summary>
        /// Returns an indeterminate progress bar value.
        /// </summary>
        public static AdaptiveProgressBarValue Indeterminate
        {
            get
            {
                return new AdaptiveProgressBarValue()
                {
                    IsIndeterminate = true
                };
            }
        }

        /// <summary>
        /// Returns a progress bar value using the specified value (0-1) representing the percent complete.
        /// </summary>
        /// <param name="d">The value, 0-1, inclusive.</param>
        /// <returns>A progress bar value.</returns>
        public static AdaptiveProgressBarValue FromValue(double d)
        {
            if (d < 0 || d > 1)
            {
                throw new ArgumentOutOfRangeException("d", "Value must be between 0 and 1, inclusive.");
            }

            return new AdaptiveProgressBarValue()
            {
                Value = d
            };
        }
    }
}
