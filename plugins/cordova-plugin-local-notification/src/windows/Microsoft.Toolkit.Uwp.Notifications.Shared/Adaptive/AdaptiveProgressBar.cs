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

#if WINRT
using System.Collections.Generic;
#endif
using System;
using Microsoft.Toolkit.Uwp.Notifications.Adaptive.Elements;

namespace Microsoft.Toolkit.Uwp.Notifications
{
    /// <summary>
    /// New in Creators Update: A progress bar. Only supported on toasts on Desktop, build 15007 or newer.
    /// </summary>
    public sealed class AdaptiveProgressBar : IToastBindingGenericChild
    {
#if WINRT
        /// <summary>
        /// Gets a dictionary of the current data bindings, where you can assign new bindings.
        /// </summary>
        public IDictionary<AdaptiveProgressBarBindableProperty, string> Bindings { get; private set; } = new Dictionary<AdaptiveProgressBarBindableProperty, string>();
#endif

        /// <summary>
        /// Gets or sets an optional title string. Supports data binding.
        /// </summary>
        public
#if WINRT
            string
#else
            BindableString
#endif
            Title { get; set; }

        /// <summary>
        /// Gets or sets the value of the progress bar. Supports data binding. Defaults to 0.
        /// </summary>
        public
#if WINRT
            AdaptiveProgressBarValue
#else
            BindableProgressBarValue
#endif
            Value { get; set; } = AdaptiveProgressBarValue.FromValue(0);

        /// <summary>
        /// Gets or sets an optional string to be displayed instead of the default percentage string. If this isn't provided, something like "70%" will be displayed.
        /// </summary>
        public
#if WINRT
            string
#else
            BindableString
#endif
            ValueStringOverride { get; set; }

        /// <summary>
        /// Required. Gets or sets a status string, which is displayed underneath the progress bar. This string should reflect the status of the operation, like "Downloading..." or "Installing..."
        /// </summary>
        public
#if WINRT
            string
#else
            BindableString
#endif
            Status { get; set; }

        internal Element_AdaptiveProgressBar ConvertToElement()
        {
            // If Value not provided, we use 0
            var val = Value;
            if (val == null)
            {
                val = AdaptiveProgressBarValue.FromValue(0);
            }

            var answer = new Element_AdaptiveProgressBar();

#if WINRT
            answer.Title = XmlWriterHelper.GetBindingOrAbsoluteXmlValue(Bindings, AdaptiveProgressBarBindableProperty.Title, Title);
            answer.Value = XmlWriterHelper.GetBindingOrAbsoluteXmlValue(Bindings, AdaptiveProgressBarBindableProperty.Value, val.ToXmlString());
            answer.ValueStringOverride = XmlWriterHelper.GetBindingOrAbsoluteXmlValue(Bindings, AdaptiveProgressBarBindableProperty.ValueStringOverride, ValueStringOverride);
            answer.Status = XmlWriterHelper.GetBindingOrAbsoluteXmlValue(Bindings, AdaptiveProgressBarBindableProperty.Status, Status);
#else
            answer.Title = Title?.ToXmlString();
            answer.Value = val.ToXmlString();
            answer.ValueStringOverride = ValueStringOverride?.ToXmlString();
            answer.Status = Status?.ToXmlString();
#endif

            if (answer.Status == null)
            {
                throw new NullReferenceException("Status property is required.");
            }

            return answer;
        }
    }
}
