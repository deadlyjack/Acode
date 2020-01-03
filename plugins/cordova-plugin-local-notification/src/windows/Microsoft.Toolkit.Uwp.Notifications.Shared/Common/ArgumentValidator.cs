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
    internal static class ArgumentValidator
    {
        public static void SetProperty<T>(ref T property, T value, string propertyName, ArgumentValidatorOptions options)
        {
            if (options.HasFlag(ArgumentValidatorOptions.NotNull))
            {
                if (value == null)
                {
                    throw new ArgumentNullException(propertyName);
                }
            }

            property = value;
        }
    }

    [Flags]
    internal enum ArgumentValidatorOptions
    {
        NotNull
    }
}
