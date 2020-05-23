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

using System.Collections.Generic;

namespace Microsoft.Toolkit.Uwp.Notifications
{
    [NotificationXmlElement("actions")]
    internal sealed class Element_ToastActions
    {
        internal const ToastSystemCommand DEFAULT_SYSTEM_COMMAND = ToastSystemCommand.None;

        [NotificationXmlAttribute("hint-systemCommands", DEFAULT_SYSTEM_COMMAND)]
        public ToastSystemCommand SystemCommands { get; set; } = ToastSystemCommand.None;

        public IList<IElement_ToastActionsChild> Children { get; private set; } = new List<IElement_ToastActionsChild>();
    }

    internal interface IElement_ToastActionsChild
    {
    }

    internal enum ToastSystemCommand
    {
        None,
        SnoozeAndDismiss
    }
}