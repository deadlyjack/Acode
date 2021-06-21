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
#include "../public/tokenizer.h"
#include "toast_js.hpp"
#include "toast_ndk.hpp"

#include <json/reader.h>
#include <json/writer.h>

using namespace std;

/**
 * Default constructor.
 */
Toast_JS::Toast_JS(const std::string& id) :
        m_id(id)
{
    m_pLogger = new webworks::Logger("Toast_JS", this);
    m_pToastController = new webworks::Toast_NDK(this);
}

/**
 * Toast_JS destructor.
 */
Toast_JS::~Toast_JS()
{
    if (m_pToastController)
        delete m_pToastController;
    if (m_pLogger)
        delete m_pLogger;
}

webworks::Logger* Toast_JS::getLog()
{
    return m_pLogger;
}

/**
 * This method returns the list of objects implemented by this native
 * extension.
 */
char* onGetObjList()
{
    static char name[] = "Toast_JS";
    return name;
}

/**
 * This method is used by JNext to instantiate the Toast_JS object when
 * an object is created on the JavaScript server side.
 */
JSExt* onCreateObject(const string& className, const string& id)
{
    if (className == "Toast_JS")
    {
        return new Toast_JS(id);
    }

    return NULL;
}

/**
 * Method used by JNext to determine if the object can be deleted.
 */
bool Toast_JS::CanDelete()
{
    return true;
}

/**
 * It will be called from JNext JavaScript side with passed string.
 * This method implements the interface for the JavaScript to native binding
 * for invoking native code. This method is triggered when JNext.invoke is
 * called on the JavaScript side with this native objects id.
 */
string Toast_JS::InvokeMethod(const string& command)
{
    m_pLogger->debug("Toast invoked");
    // format must be: "command callbackId params"
    size_t commandIndex = command.find_first_of(" ");
    std::string strCommand = command.substr(0, commandIndex);
    size_t callbackIndex = command.find_first_of(" ", commandIndex + 1);
    std::string callbackId = command.substr(commandIndex + 1, callbackIndex - commandIndex - 1);
    std::string arg = command.substr(callbackIndex + 1, command.length());
    m_pLogger->debug(command.c_str());
    m_pLogger->debug(arg.c_str());

    Json::FastWriter writer;
    Json::Reader reader;
    Json::Value root;
    bool parse = reader.parse(arg, root);

    if (!parse)
    {
        m_pLogger->error("Parse Error");
        Json::Value error;
        error["result"] = "Cannot parse JSON object";
        NotifyEvent(callbackId + " error " + writer.write(error));
    } else
    {
        if (strCommand == "show")
        {
            m_pToastController->toast(root["message"].asString(), root["duration"].asString(), root["position"].asString(), callbackId);
        }
    }


    strCommand.append(";");
    strCommand.append(command);
    return strCommand;
}

// Notifies JavaScript of an event
void Toast_JS::NotifyEvent(const std::string& event)
{
    std::string eventString = m_id + " ";
    eventString.append(event);
    SendPluginEvent(eventString.c_str(), m_pContext);
}
