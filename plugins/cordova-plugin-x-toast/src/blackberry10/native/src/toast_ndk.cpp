/*
 * Copyright (c) 2013 BlackBerry Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <string>
#include "toast_ndk.hpp"
#include "toast_js.hpp"

#include <bb/system/SystemToast>
#include <bb/system/SystemUiPosition>

using namespace bb::system;

namespace webworks
{

    Toast_NDK::Toast_NDK(Toast_JS *parent) :
            m_pParent(parent)
    {
    }

    Toast_NDK::~Toast_NDK()
    {
    }

    void Toast_NDK::toast(const std::string& message, const std::string& duration,
            const std::string& position, const std::string callbackId)
    {

        SystemToast* m_toast;
        m_toast = new SystemToast();

        m_toast->setBody(message.c_str());

        if (position == "top")
        {
            m_toast->setPosition(SystemUiPosition::TopCenter);
        } else if (position == "bottom")
        {
            m_toast->setPosition(SystemUiPosition::BottomCenter);
        } else

        {
            m_toast->setPosition(SystemUiPosition::MiddleCenter);
        }

        m_toast->show();

        m_pParent->NotifyEvent(callbackId);
    }

} /* namespace webworks */
