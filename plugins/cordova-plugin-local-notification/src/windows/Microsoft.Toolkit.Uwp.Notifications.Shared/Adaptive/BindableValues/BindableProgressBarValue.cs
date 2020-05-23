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
    // Note that this code is NOT compiled for WinRT.
    // WinRT uses a different binding system since it doesn't support implicit type converters.
#if !WINRT
    /// <summary>
    /// A binding value for doubles.
    /// </summary>
    public sealed class BindableProgressBarValue
    {
        /// <summary>
        /// Raw value is used for the implicit converter case, where dev provided a raw double. We store the raw value,
        /// so that later on when generating the XML, we can provide this value rather than binding syntax.
        /// </summary>
        internal AdaptiveProgressBarValue RawValue { get; private set; }

        internal bool RawIsIndeterminate { get; private set; }

        /// <summary>
        /// The name that maps to your binding data value.
        /// </summary>
        public string BindingName { get; set; }

        /// <summary>
        /// Initializes a new binding for a double value, with the required binding value name. Do NOT include surrounding {} brackets.
        /// </summary>
        /// <param name="bindingName">The name that maps to your binding data value.</param>
        public BindableProgressBarValue(string bindingName)
        {
            BindingName = bindingName;
        }

        /// <summary>
        /// Private constructor used by the implicit converter to assign the raw value.
        /// </summary>
        private BindableProgressBarValue()
        {
        }

        internal string ToXmlString()
        {
            if (BindingName != null)
            {
                return "{" + BindingName + "}";
            }

            if (RawValue != null)
            {
                return RawValue.ToXmlString();
            }

            return null;
        }

        /// <summary>
        /// Creates a <see cref="BindableProgressBarValue"/> that has a raw value assigned.
        /// </summary>
        /// <param name="v">The raw value</param>
        public static implicit operator BindableProgressBarValue(AdaptiveProgressBarValue v)
        {
            return new BindableProgressBarValue()
            {
                RawValue = v
            };
        }

        /// <summary>
        /// Returns the raw value of the <see cref="BindableProgressBarValue"/>.
        /// </summary>
        /// <param name="b">The <see cref="BindableProgressBarValue"/> to obtain the raw value from.</param>
        public static implicit operator AdaptiveProgressBarValue(BindableProgressBarValue b)
        {
            return b.RawValue;
        }

        /// <summary>
        /// Creates an <see cref="BindableProgressBarValue"/> that has tbe raw double value.
        /// </summary>
        /// <param name="d">The raw value</param>
        public static implicit operator BindableProgressBarValue(double d)
        {
            return AdaptiveProgressBarValue.FromValue(d);
        }
    }
#endif
}