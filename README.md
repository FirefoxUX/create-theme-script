# Create Theme Script

This is a tool for personal use to convert a Figma color export to WebExtension theme manifests for Firefox.
Alongside manifests, this tool generates other theme metadata such as icon, preview images, and Firefox build information.

input.json is a Figma export created with the [design-tokens](https://github.com/lukasoppermann/design-tokens) plugin. 

To run this script:

```
npm install
node parse-themes-script.js
```
