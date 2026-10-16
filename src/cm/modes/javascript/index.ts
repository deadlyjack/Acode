import { javascript } from "@codemirror/lang-javascript";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import { jsdocWrap } from "../jsdoc";

// Lezer tags class and interface method names like property definitions;
// tag them as functions so themes can colour methods like other editors do.
const methodNames = styleTags({
	"MethodDeclaration/PropertyDefinition MethodDeclaration/PrivatePropertyDefinition MethodType/PropertyDefinition":
		t.function(t.definition(t.propertyName)),
});

/**
 * JavaScript/TypeScript support with JSDoc highlighting inside `/** *\/`
 * comments and method names tagged as functions.
 */
export function javascriptSupport(
	config: { jsx?: boolean; typescript?: boolean } = {},
): LanguageSupport {
	const support = javascript(config);
	const language = support.language;
	if (!(language instanceof LRLanguage)) return support;
	return new LanguageSupport(
		language.configure({ props: [methodNames], wrap: jsdocWrap }),
		support.support,
	);
}
