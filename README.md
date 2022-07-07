This is a tool for personal use to convert a Figma color export to WebExtension theme manifests. The Figma export is created with the [design-tokens](https://github.com/lukasoppermann/design-tokens) plugin. Other theme metadata such as icon, preview images, and Firefox build information is also generated.

input.json is pulled from https://github.com/FirefoxUX/themes/blob/main/tokens/color/base.json and lightly edited.

To run this script:

```
npm install
node parse-themes-script.js
```
