define("ace/snippets/c_cpp",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.snippetText = "## STL Collections\n\
# boilerplate\n\
snippet cpp\n\
	#include <iostream> \n\
  using namespace std;\n\
  int main()\n\
  { \n\
    ${1:/*Write your code*/}\n\
    return 0; \n\
  }\n\
# #include\n\
snippet #include\n\
	#include\n\
# #define\n\
snippet #define\n\
	#define\n\
# using\n\
snippet using\n\
	using\n\
# namespace\n\
snippet namespace\n\
	namespace\n\
# iostream\n\
snippet iostream\n\
	iostream\n\
# string\n\
snippet string\n\
	string\n\
# vector\n\
snippet vector\n\
	vector\n\
# cmath\n\
snippet cmath\n\
	cmath\n\
# memory\n\
snippet memory\n\
	memory\n\
# algorithm\n\
snippet algorithm\n\
	algorithm\n\
# queue\n\
snippet queue\n\
	queue\n\
# deque\n\
snippet deque\n\
	deque\n\
# set\n\
snippet set\n\
	set\n\
# stack\n\
snippet stack\n\
	stack\n\
# map\n\
snippet map\n\
	map\n\
# unordered_map\n\
snippet unordered_map\n\
	unordered_map\n\
# climits\n\
snippet climits\n\
	climits\n\
# time.h\n\
snippet time.h\n\
	time.h\n\
# stdlib.h\n\
snippet stdlib.h\n\
	stdlib.h\n\
# bits/stdc++.h\n\
snippet bits/stdc++.h\n\
	bits/stdc++.h\n\
# conio.h\n\
snippet conio.h\n\
	conio.h\n\
# greater<T>\n\
snippet gre\n\
	greater<${1:T}>${2}\n\
# if\n\
snippet if\n\
	if(${1:/*condition*/})\n\
	{\n\
	  ${2:/*your code*/}\n\
	}${3}\n\
# if else\n\
snippet ifelse\n\
	if(${1:/*condition*/})\n\
	{\n\
	  ${2:/*your code*/}\n\
	}\n\
	else\n\
	{\n\
	  ${3:/*your code*/}\n\
	}${4}\n\
# elseif\n\
snippet elseif\n\
	else if(${1:/*condition*/})\n\
	{\n\
	  ${2:/*your code*/}\n\
	}${3}\n\
# while\n\
snippet while\n\
	while(${1:/*condition*/})\n\
	{\n\
	  ${2:/*your code*/}\n\
	}${3}\n\
snippet do while\n\
  do\n\
	{\n\
	  ${2:/*your code*/}\n\
	}${3}\n\
	while(${1:/*condition*/});\n\
# std::array\n\
snippet array\n\
	std::array<${1:T}, ${2:N}> ${3};${4}\n\
# std::vector\n\
snippet vector\n\
	std::vector<${1:T}> ${2};${3}\n\
# std::deque\n\
snippet deque\n\
	std::deque<${1:T}> ${2};${3}\n\
# std::forward_list\n\
snippet flist\n\
	std::forward_list<${1:T}> ${2};${3}\n\
# std::list\n\
snippet list\n\
	std::list<${1:T}> ${2};${3}\n\
# std::set\n\
snippet set\n\
	std::set<${1:T}> ${2};${3}\n\
# std::map\n\
snippet map\n\
	std::map<${1:Key}, ${2:T}> ${3};${4}\n\
# std::multiset\n\
snippet mset\n\
	std::multiset<${1:T}> ${2};${3}\n\
# std::multimap\n\
snippet mmap\n\
	std::multimap<${1:Key}, ${2:T}> ${3};${4}\n\
# std::unordered_set\n\
snippet uset\n\
	std::unordered_set<${1:T}> ${2};${3}\n\
# std::unordered_map\n\
snippet umap\n\
	std::unordered_map<${1:Key}, ${2:T}> ${3};${4}\n\
# std::unordered_multiset\n\
snippet umset\n\
	std::unordered_multiset<${1:T}> ${2};${3}\n\
# std::unordered_multimap\n\
snippet ummap\n\
	std::unordered_multimap<${1:Key}, ${2:T}> ${3};${4}\n\
# std::stack\n\
snippet stack\n\
	std::stack<${1:T}> ${2};${3}\n\
# std::queue\n\
snippet queue\n\
	std::queue<${1:T}> ${2};${3}\n\
# std::priority_queue\n\
snippet pqueue\n\
	std::priority_queue<${1:T}> ${2};${3}\n\
##\n\
## Access Modifiers\n\
# private\n\
snippet pri\n\
	private\n\
# protected\n\
snippet pro\n\
	protected\n\
# public\n\
snippet pub\n\
	public\n\
# friend\n\
snippet fr\n\
	friend\n\
# mutable\n\
snippet mu\n\
	mutable\n\
## \n\
## Class\n\
# class\n\
snippet cl\n\
	class ${1:`Filename('$1', 'name')`} \n\
	{\n\
	public:\n\
		$1(${2});\n\
		~$1();\n\
\n\
	private:\n\
		${3:/* data */}\n\
	};\n\
# member function implementation\n\
snippet mfun\n\
	${4:void} ${1:`Filename('$1', 'ClassName')`}::${2:memberFunction}(${3}) {\n\
		${5:/* code */}\n\
	}\n\
# namespace\n\
snippet ns\n\
	namespace ${1:`Filename('', 'my')`} {\n\
		${2}\n\
	} /* namespace $1 */\n\
##\n\
## Input/Output\n\
# std::cout\n\
snippet cout\n\
	std::cout << ${1} << std::endl;${2}\n\
# std::cin\n\
snippet cin\n\
	std::cin >> ${1};${2}\n\
##\n\
## Iteration\n\
# for i \n\
snippet fori\n\
	for (int ${2:i} = 0; $2 < ${1:count}; $2${3:++}) {\n\
		${4:/* code */}\n\
	}${5}\n\
\n\
# foreach\n\
snippet fore\n\
	for (${1:auto} ${2:i} : ${3:container}) {\n\
		${4:/* code */}\n\
	}${5}\n\
# iterator\n\
snippet iter\n\
	for (${1:std::vector}<${2:type}>::${3:const_iterator} ${4:i} = ${5:container}.begin(); $4 != $5.end(); ++$4) {\n\
		${6}\n\
	}${7}\n\
\n\
# auto iterator\n\
snippet itera\n\
	for (auto ${1:i} = $1.begin(); $1 != $1.end(); ++$1) {\n\
		${2:std::cout << *$1 << std::endl;}\n\
	}${3}\n\
##\n\
## Lambdas\n\
# lamda (one line)\n\
snippet ld\n\
	[${1}](${2}){${3:/* code */}}${4}\n\
# lambda (multi-line)\n\
snippet lld\n\
	[${1}](${2}){\n\
		${3:/* code */}\n\
	}${4}\n\
";
exports.scope = "c_cpp";

});                (function() {
                    window.require(["ace/snippets/c_cpp"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            