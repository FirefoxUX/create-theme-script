import { readFile, mkdir, writeFile } from "fs";
import { colord } from "colord";

let jarBuffer = [],
  jarLongestString = 0;
let browserGlueBuffer = [];
let aboutaddonsBuffer = [];
const kVersionNumber = "1.0";

try {
  readFile("./input.json", "utf8", (err, data) => {
    if (err) {
      console.warn(`Failed to read file: ${err}`);
    }

    let json = JSON.parse(data);
    for (let [group, themes] of Object.entries(json)) {
      for (let [name, colors] of Object.entries(themes)) {
        console.log(`Processing ${name}`);
        let [colorName, variantName] = name.split("-");
        switch (variantName) {
          case "light":
            variantName = "soft";
            break;
          case "medium":
            variantName = "balanced";
            break;
          case "dark":
            variantName = "bold";
            break;
        }
        let idName = `${colorName}-${variantName}`;
        let displayName = `${
          colorName[0].toLocaleUpperCase() + colorName.substring(1)
        } (${variantName[0].toLocaleUpperCase() + variantName.substring(1)})`;

        // Color definitions.
        const frameColor = colord(
          colors["01-background-base"].value
        ).toHslString();
        const toolbarColor = colord(
          colors["02-background-toolbar"].value
        ).toHslString();
        let darkText = colord(
          colors["03a-text-toolbar"]?.value || colors["03-text-toolbar"].value
        ).toHslString();
        let brightText = colord(
          colors["03b-text-toolbar"]?.value || colors["03-text-toolbar"].value
        ).toHslString();
        // Cheers (Balanced) is unusal because it flips all the text colors
        // used in the other balanced themes.
        if (idName == "cheers-balanced") {
          let temp = brightText;
          brightText = darkText;
          darkText = temp;
        }
        const backgroundContent = colord(
          colors["04-background-content-light"].value
        ).toHslString();
        const borderLowContrast = colord(
          colors["05-border-low-contrast"].value
        ).toHslString();
        let borderHighContrast = colord(
          colors["06-border-high-contrast"].value
        ).toHslString();
        // Even though border-high-contrast is defined for most themes, it
        // shouldn't be used in Soft and Balanced themes.
        if (variantName != "bold") {
          borderHighContrast = "transparent";
        }
        // Ignore 07-highlight-row, since the default color is used.
        const highlightRows = colord(
          colors["08-highlight-rows"].value
        ).toHslString();
        const modalBackgroundPrimary = colord(
          colors["09a-modal-backgrounds"]?.value ||
            colors["09-modal-backgrounds"].value
        ).toHslString();
        const modalBackgroundTabAndSearch = colord(
          colors["09b-modal-backgrounds-tab-and-search"]?.value ||
            colors["09-modal-backgrounds"].value
        ).toHslString();
        const urlColor = colord(colors["10-url-details"].value).toHslString();

        const toolbarFieldBackground =
          variantName == "balanced" ? modalBackgroundTabAndSearch : frameColor;
        const chicletBackground =
          variantName == "balanced" ? frameColor : modalBackgroundTabAndSearch;

        // Manifest definition.
        let manifest = {
          manifest_version: 2,

          applications: {
            gecko: {
              id: `firefox-${idName}@mozilla.org`,
            },
          },

          name: displayName,
          author: "Mozilla",
          version: kVersionNumber,

          icons: { 32: "icon.svg" },

          theme: {
            colors: {
              tab_background_text: brightText,
              tab_text: darkText,
              tab_selected: modalBackgroundTabAndSearch,
              tab_line: borderHighContrast,

              frame: frameColor,

              popup: modalBackgroundPrimary,
              popup_text: darkText,
              popup_border: borderLowContrast,
              popup_highlight: highlightRows,
              popup_highlight_text: darkText,

              toolbar: toolbarColor,
              toolbar_text: brightText,

              toolbar_field: toolbarFieldBackground,
              toolbar_field_text: darkText,
              toolbar_field_focus: modalBackgroundPrimary,
              toolbar_field_border_focus: borderLowContrast,

              ntp_background: backgroundContent,
              ntp_card_background: modalBackgroundPrimary,
              ntp_text: darkText,

              sidebar: modalBackgroundPrimary,
              sidebar_text: darkText,
              sidebar_highlight: highlightRows,

              // Experimental properties follow.
              address_bar_box: chicletBackground,
              address_bar_box_focus: toolbarColor,
              address_bar_box_text: brightText,
              address_bar_url_color: urlColor,
              panel_item_hover: highlightRows,
              panel_item_active: colord(highlightRows)
                .alpha(colord(highlightRows).alpha() + 0.15)
                .toHslString(),
              panel_separator: borderLowContrast,
            },
          },
          theme_experiment: {
            colors: {
              address_bar_box: "--urlbar-box-bgcolor",
              address_bar_box_focus: "--urlbar-box-focus-bgcolor",
              address_bar_box_text: "--urlbar-box-text-color",
              address_bar_url_color: "--urlbar-popup-url-color",
              panel_item_hover: "--panel-item-hover-bgcolor",
              panel_item_active: "--panel-item-active-bgcolor",
              panel_separator: "--panel-separator-color",
            },
          },
        };

        // Create the folder structure.
        mkdir(`./themes/${group}`, (err) => {
          if (err) {
            console.warn(`Failed to create new directory: ${err}`);
          }
        });
        mkdir(`./themes/${group}/${variantName}`, (err) => {
          if (err) {
            console.warn(`Failed to create new directory: ${err}`);
          }
        });

        // Write the manifest file.
        const manifestOutput = JSON.stringify(manifest, null, 2).concat('\n');
        writeFile(
          `./themes/${group}/${variantName}/manifest.json`,
          manifestOutput,
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );

        // Create and write the icon.
        const icon = `<!-- This Source Code Form is subject to the terms of the Mozilla Public
  - License, v. 2.0. If a copy of the MPL was not distributed with this
  - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->
<svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="31.5" cy="31" r="31" fill="url(#paint0_linear)"/>
  <defs>
    <linearGradient id="paint0_linear" x1="44.4829" y1="19" x2="10.4829" y2="53" gradientUnits="userSpaceOnUse">
      <stop stop-color="${frameColor}"/>
      <stop offset="1" stop-color="${toolbarColor}"/>
    </linearGradient>
  </defs>
</svg>
`;
        writeFile(`./themes/${group}/${variantName}/icon.svg`, icon, (err) => {
          if (err) {
            console.log(err);
          }
        });

        // Create and write the preview image.
        const preview = `<!-- This Source Code Form is subject to the terms of the Mozilla Public
  - License, v. 2.0. If a copy of the MPL was not distributed with this
  - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->
<svg width="680" height="92" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="92" fill="${frameColor}" />
  <rect x="28" y="5" width="166" height="34" rx="4" fill="${modalBackgroundTabAndSearch}" stroke="${borderHighContrast}" stroke-width="1.5" />
  <rect x="51" y="20" width="121" height="4" rx="2" fill="${darkText}" />
  <rect x="221" y="20" width="121" height="4" rx="2" fill="${brightText}" />
  <rect y="44" width="680" height="48" fill="${toolbarColor}" />
  <circle cx="24" cy="68" r="6.25" stroke="${brightText}" stroke-width="1.5" />
  <circle cx="60" cy="68" r="6.25" stroke="${brightText}" stroke-width="1.5" />
  <line x1="663" y1="73.75" x2="649" y2="73.75" stroke="${brightText}" stroke-width="1.5" />
  <line x1="663" y1="67.75" x2="649" y2="67.75" stroke="${brightText}" stroke-width="1.5" />
  <line x1="663" y1="61.75" x2="649" y2="61.75" stroke="${brightText}" stroke-width="1.5" />
  <rect x="114" y="52" width="488" height="32" rx="4" fill="${toolbarFieldBackground}" />
  <circle cx="130" cy="68" r="6.25" stroke="${darkText}" stroke-width="1.5" />
  <rect x="146" y="66" width="308" height="4" rx="2" fill="${darkText}" />
</svg>
`;
        writeFile(`./themes/${group}/${variantName}/preview.svg`, preview, (err) => {
          if (err) {
            console.log(err);
          }
        });

        // Save the strings to be saved to jar.mn.
        // browser/themes/addons/jar.mn
        jarBuffer.push([
          `content/builtin-themes/monochromatic/${colorName}/${variantName}`,
          `(monochromatic/${colorName}/${variantName}/*.svg)`,
        ]);
        jarBuffer.push([
          `content/builtin-themes/monochromatic/${colorName}/${variantName}/manifest.json`,
          `(monochromatic/${colorName}/${variantName}/manifest.json)`,
        ]);
        if (
          `content/builtin-themes/monochromatic/${colorName}/${variantName}/manifest.json`
            .length > jarLongestString
        ) {
          jarLongestString =
            `content/builtin-themes/monochromatic/${colorName}/${variantName}/manifest.json`
              .length;
        }

        // Save the strings for BrowserGlue and aboutaddons.js.
        browserGlueBuffer.push(
          JSON.stringify(
            {
              id: `firefox-${idName}@mozilla.org`,
              version: kVersionNumber,
              path: `${colorName}/${variantName}/`,
            },
            null,
            2
          )
        );
        aboutaddonsBuffer.push(`[
  "firefox-${idName}@mozilla.org",
  "resource://builtin-themes/monochromatic/${colorName}/${variantName}/preview.svg",
]`);
      }
    }

    // Write metadata.
    mkdir(`./themes/metadata`, (err) => {
      if (err) {
        console.warn(`Failed to create new directory: ${err}`);
      }
    });

    let jarStr = jarBuffer
      .map((pair) => {
        return pair.join(" ".repeat(jarLongestString - pair[0].length + 3));
      })
      .join("\n");
    writeFile(
      `./themes/metadata/browser-themes-addons-jar.txt`,
      jarStr,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    writeFile(
      `./themes/metadata/browser-glue.txt`,
      browserGlueBuffer.join(",\n"),
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    writeFile(
      `./themes/metadata/aboutaddons.txt`,
      aboutaddonsBuffer.join(",\n"),
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
  });
} catch (ex) {
  console.warn(`Failed to read file: ${ex}.`);
}
