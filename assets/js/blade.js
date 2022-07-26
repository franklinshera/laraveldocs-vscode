/*! `blade` grammar compiled for Highlight.js 11.4.0 */
(() => {
  var e = (() => {
    "use strict";
    return (e) => ({
      name: "Blade",
      case_insensitive: !0,
      subLanguage: "php-template",
      contains: [
        e.COMMENT(/\{\{--/, /--\}\}/),
        {
          className: "template-variable",
          begin: /\{\{/,
          starts: { end: /\}\}/, returnEnd: !0, subLanguage: "php" },
        },
        { className: "template-variable", begin: /\}\}/ },
        {
          className: "template-variable",
          begin: /\{\{\{/,
          starts: { end: /\}\}\}/, returnEnd: !0, subLanguage: "php" },
        },
        { className: "template-variable", begin: /\}\}\}/ },
        {
          className: "template-variable",
          begin: /\{!!/,
          starts: { end: /!!\}/, returnEnd: !0, subLanguage: "php" },
        },
        { className: "template-variable", begin: /!!\}/ },
        {
          className: "template-tag",
          begin: /@php\(/,
          starts: { end: /\)/, returnEnd: !0, subLanguage: "php" },
          relevance: 15,
        },
        {
          className: "template-tag",
          begin: /@php/,
          starts: {
            end: /@endphp/,
            returnEnd: !0,
            subLanguage: "php",
          },
          relevance: 10,
        },
        {
          className: "attr",
          begin: /:[\w-]+="/,
          starts: { end: /"(?=\s|\n|\/)/, returnEnd: !0, subLanguage: "php" },
        },
        {
          begin: /@\w+/,
          end: /\W/,
          excludeEnd: !0,
          className: "template-tag",
        },
      ],
    });
  })();
  highlightjs.registerLanguage("blade", e);
})();
