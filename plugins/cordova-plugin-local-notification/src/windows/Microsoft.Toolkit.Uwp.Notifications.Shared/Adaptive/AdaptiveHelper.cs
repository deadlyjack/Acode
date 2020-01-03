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

namespace Microsoft.Toolkit.Uwp.Notifications.Adaptive
{
    internal static class AdaptiveHelper
    {
        internal static object ConvertToElement(object obj)
        {
            if (obj is AdaptiveText)
            {
                return (obj as AdaptiveText).ConvertToElement();
            }

            if (obj is AdaptiveImage)
            {
                return (obj as AdaptiveImage).ConvertToElement();
            }

            if (obj is AdaptiveGroup)
            {
                return (obj as AdaptiveGroup).ConvertToElement();
            }

            if (obj is AdaptiveSubgroup)
            {
                return (obj as AdaptiveSubgroup).ConvertToElement();
            }

            if (obj is AdaptiveProgressBar)
            {
                return (obj as AdaptiveProgressBar).ConvertToElement();
            }

            throw new NotImplementedException("Unknown object: " + obj.GetType());
        }
    }
}
