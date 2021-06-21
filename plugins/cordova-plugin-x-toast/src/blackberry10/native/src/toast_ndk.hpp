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

#ifndef toast_NDK_HPP_
#define toast_NDK_HPP_

#include <string>
#include <pthread.h>

class Toast_JS;

namespace webworks {

class Toast_NDK {
public:
	explicit Toast_NDK(Toast_JS *parent = NULL);
	virtual ~Toast_NDK();

	void toast(const std::string& message, const std::string& duration, const std::string& position, const std::string callbackId);


private:
	Toast_JS *m_pParent;
};

} // namespace webworks

#endif /* toast_NDK_HPP_ */
