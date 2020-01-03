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
#if WINDOWS_UWP

#endif

namespace Microsoft.Toolkit.Uwp.Notifications
{
    internal sealed class NotificationXmlAttributeAttribute : Attribute
    {
        public string Name { get; private set; }

        public object DefaultValue { get; private set; }

        public NotificationXmlAttributeAttribute(string name, object defaultValue = null)
        {
            Name = name;
            DefaultValue = defaultValue;
        }
    }
}