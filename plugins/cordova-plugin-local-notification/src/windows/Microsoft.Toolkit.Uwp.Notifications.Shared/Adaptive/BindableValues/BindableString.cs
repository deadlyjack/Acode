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
    /// A binding value for strings.
    /// </summary>
    public sealed class BindableString
    {
        internal string RawValue { get; private set; }

        /// <summary>
        /// The name that maps to your binding data value.
        /// </summary>
        public string BindingName { get; set; }

        /// <summary>
        /// Initializes a new binding for a string value, with the required binding name. Do NOT include surrounding {} brackets.
        /// </summary>
        /// <param name="bindingName">The name that maps to your data binding value.</param>
        public BindableString(string bindingName)
        {
            BindingName = bindingName;
        }

        /// <summary>
        /// Private constructor used by the implicit converter to assign the raw value.
        /// </summary>
        private BindableString()
        {
        }

        internal string ToXmlString()
        {
            if (BindingName != null)
            {
                return "{" + BindingName + "}";
            }

            return RawValue;
        }

        /// <summary>
        /// Creates a <see cref="BindableString"/> that has a raw value assigned.
        /// </summary>
        /// <param name="d">The raw value</param>
        public static implicit operator BindableString(string d)
        {
            return new BindableString()
            {
                RawValue = d
            };
        }

        /// <summary>
        /// Returns the raw value of the <see cref="BindableString"/>.
        /// </summary>
        /// <param name="b">The <see cref="BindableString"/> to obtain the raw value from.</param>
        public static implicit operator string(BindableString b)
        {
            return b.RawValue;
        }
    }
#endif
}