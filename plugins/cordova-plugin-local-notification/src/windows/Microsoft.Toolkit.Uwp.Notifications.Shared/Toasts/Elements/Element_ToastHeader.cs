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
    [NotificationXmlElement("header")]
    internal sealed class Element_ToastHeader : IElement_ToastActivatable
    {
        [NotificationXmlAttribute("id")]
        public string Id { get; set; }

        [NotificationXmlAttribute("title")]
        public string Title { get; set; }

        [NotificationXmlAttribute("arguments")]
        public string Arguments { get; set; }

        [NotificationXmlAttribute("activationType", Element_ToastActivationType.Foreground)]
        public Element_ToastActivationType ActivationType { get; set; } = Element_ToastActivationType.Foreground;

        [NotificationXmlAttribute("protocolActivationTargetApplicationPfn")]
        public string ProtocolActivationTargetApplicationPfn { get; set; }

        [NotificationXmlAttribute("afterActivationBehavior", ToastAfterActivationBehavior.Default)]
        public ToastAfterActivationBehavior AfterActivationBehavior
        {
            get
            {
                return ToastAfterActivationBehavior.Default;
            }

            set
            {
                if (value != ToastAfterActivationBehavior.Default)
                {
                    throw new InvalidOperationException("AfterActivationBehavior on ToastHeader only supports the Default value.");
                }
            }
        }
    }
}
