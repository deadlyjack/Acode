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
    [NotificationXmlElement("toast")]
    internal sealed class Element_Toast : BaseElement, IElement_ToastActivatable
    {
        internal const ToastScenario DEFAULT_SCENARIO = ToastScenario.Default;
        internal const Element_ToastActivationType DEFAULT_ACTIVATION_TYPE = Element_ToastActivationType.Foreground;
        internal const ToastDuration DEFAULT_DURATION = ToastDuration.Short;

        [NotificationXmlAttribute("activationType", DEFAULT_ACTIVATION_TYPE)]
        public Element_ToastActivationType ActivationType { get; set; } = DEFAULT_ACTIVATION_TYPE;

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
                    throw new InvalidOperationException("AfterActivationBehavior on ToastContent only supports the Default value.");
                }
            }
        }

        [NotificationXmlAttribute("duration", DEFAULT_DURATION)]
        public ToastDuration Duration { get; set; } = DEFAULT_DURATION;

        [NotificationXmlAttribute("launch")]
        public string Launch { get; set; }

        [NotificationXmlAttribute("scenario", DEFAULT_SCENARIO)]
        public ToastScenario Scenario { get; set; } = DEFAULT_SCENARIO;

        [NotificationXmlAttribute("displayTimestamp")]
        public DateTimeOffset? DisplayTimestamp { get; set; }

        public Element_ToastVisual Visual { get; set; }

        public Element_ToastAudio Audio { get; set; }

        public Element_ToastActions Actions { get; set; }

        public Element_ToastHeader Header { get; set; }

        public static Element_ToastActivationType ConvertActivationType(ToastActivationType publicType)
        {
            switch (publicType)
            {
                case ToastActivationType.Foreground:
                    return Element_ToastActivationType.Foreground;

                case ToastActivationType.Background:
                    return Element_ToastActivationType.Background;

                case ToastActivationType.Protocol:
                    return Element_ToastActivationType.Protocol;

                default:
                    throw new NotImplementedException();
            }
        }
    }

    /// <summary>
    /// The amount of time the Toast should display.
    /// </summary>
    public enum ToastDuration
    {
        /// <summary>
        /// Default value. Toast appears for a short while and then goes into Action Center.
        /// </summary>
        Short,

        /// <summary>
        /// Toast stays on-screen for longer, and then goes into Action Center.
        /// </summary>
        [EnumString("long")]
        Long
    }

    /// <summary>
    /// Specifies the scenario, controlling behaviors about the Toast.
    /// </summary>
    public enum ToastScenario
    {
        /// <summary>
        /// The normal Toast behavior. The Toast appears for a short duration, and then automatically dismisses into Action Center.
        /// </summary>
        Default,

        /// <summary>
        /// Causes the Toast to stay on-screen and expanded until the user takes action. Also causes a looping alarm sound to be selected by default.
        /// </summary>
        [EnumString("alarm")]
        Alarm,

        /// <summary>
        /// Causes the Toast to stay on-screen and expanded until the user takes action.
        /// </summary>
        [EnumString("reminder")]
        Reminder,

        /// <summary>
        /// Causes the Toast to stay on-screen and expanded until the user takes action (on Mobile this expands to full screen). Also causes a looping incoming call sound to be selected by default.
        /// </summary>
        [EnumString("incomingCall")]
        IncomingCall
    }
}