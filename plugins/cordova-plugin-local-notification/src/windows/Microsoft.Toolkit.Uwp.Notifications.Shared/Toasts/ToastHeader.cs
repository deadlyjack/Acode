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
    /// Defines a visual header for the toast notification.
    /// </summary>
    public sealed class ToastHeader
    {
        /// <summary>
        /// Constructs a toast header with all the required properties.
        /// </summary>
        /// <param name="id">A developer-created identifier that uniquely identifies this header. If two notifications have the same header id, they will be displayed underneath the same header in Action Center.</param>
        /// <param name="title">A title for the header.</param>
        /// <param name="arguments">A developer-defined string of arguments that is returned to the app when the user clicks this header.</param>
        public ToastHeader(string id, string title, string arguments)
        {
            Id = id;
            Title = title;
            Arguments = arguments;
        }

        private string _id;

        /// <summary>
        /// Gets or sets a developer-created identifier that uniquely identifies this header. If two notifications have the same header id, they will be displayed underneath the same header in Action Center. Cannot be null.
        /// </summary>
        public string Id
        {
            get { return _id; }
            set { ArgumentValidator.SetProperty(ref _id, value, nameof(Id), ArgumentValidatorOptions.NotNull); }
        }

        private string _title;

        /// <summary>
        /// Gets or sets a title for the header. Cannot be null.
        /// </summary>
        public string Title
        {
            get { return _title; }
            set { ArgumentValidator.SetProperty(ref _title, value, nameof(Title), ArgumentValidatorOptions.NotNull); }
        }

        private string _arguments;

        /// <summary>
        /// Gets or sets a developer-defined string of arguments that is returned to the app when the user clicks this header. Cannot be null.
        /// </summary>
        public string Arguments
        {
            get { return _arguments; }
            set { ArgumentValidator.SetProperty(ref _arguments, value, nameof(Arguments), ArgumentValidatorOptions.NotNull); }
        }

        private ToastActivationType _activationType = ToastActivationType.Foreground;

        /// <summary>
        /// Gets or sets the type of activation this header will use when clicked. Defaults to Foreground. Note that only Foreground and Protocol are supported.
        /// </summary>
        public ToastActivationType ActivationType
        {
            get
            {
                return _activationType;
            }

            set
            {
                switch (value)
                {
                    case ToastActivationType.Foreground:
                    case ToastActivationType.Protocol:
                        _activationType = value;
                        break;

                    default:
                        throw new ArgumentException($"ActivationType of {value} is not supported on ToastHeader.");
                }
            }
        }

        /// <summary>
        /// New in Creators Update: Additional options relating to activation of the toast header.
        /// </summary>
        public ToastActivationOptions ActivationOptions { get; set; }

        internal Element_ToastHeader ConvertToElement()
        {
            if (ActivationOptions != null)
            {
                if (ActivationOptions.AfterActivationBehavior != ToastAfterActivationBehavior.Default)
                {
                    throw new InvalidOperationException("ToastHeader does not support a custom AfterActivationBehavior. Please ensure ActivationOptions.AfterActivationBehavior is set to Default.");
                }
            }

            var el = new Element_ToastHeader()
            {
                Id = Id,
                Title = Title,
                Arguments = Arguments,
                ActivationType = Element_Toast.ConvertActivationType(ActivationType)
            };

            ActivationOptions?.PopulateElement(el);

            return el;
        }
    }
}
