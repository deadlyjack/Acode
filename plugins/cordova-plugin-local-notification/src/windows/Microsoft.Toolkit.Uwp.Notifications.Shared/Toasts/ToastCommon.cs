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
    /// Decides the type of activation that will be used when the user interacts with the Toast notification.
    /// </summary>
    public enum ToastActivationType
    {
        /// <summary>
        /// Default value. Your foreground app is launched.
        /// </summary>
        Foreground,

        /// <summary>
        /// Your corresponding background task (assuming you set everything up) is triggered, and you can execute code in the background (like sending the user's quick reply message) without interrupting the user.
        /// </summary>
        [EnumString("background")]
        Background,

        /// <summary>
        /// Launch a different app using protocol activation.
        /// </summary>
        [EnumString("protocol")]
        Protocol
    }

    /// <summary>
    /// Specifies the behavior that the toast should use when the user takes action on the toast.
    /// </summary>
    public enum ToastAfterActivationBehavior
    {
        /// <summary>
        /// Default behavior. The toast will be dismissed when the user takes action on the toast.
        /// </summary>
        Default,

        /// <summary>
        /// After the user clicks a button on your toast, the notification will remain present, in a "pending update" visual state. You should immediately update your toast from a background task so that the user does not see this "pending update" visual state for too long.
        /// </summary>
        [EnumString("pendingUpdate")]
        PendingUpdate
    }
}
