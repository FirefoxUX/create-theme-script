import { readFile, mkdir, writeFile } from "fs";
import { colord } from "colord";

let jarBuffer = [],
  jarLongestString = 0;
let browserGlueBuffer = [];
let aboutaddonsBuffer = [];
const kVersionNumber = "1.0";

function writeManifest(data) {
  let json = JSON.parse(data);
  for (let [name, colors] of Object.entries(json)) {
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
    } – ${variantName[0].toLocaleUpperCase() + variantName.substring(1)}`;

    // Color definitions.
    const frameColor = colord(colors["01-background-base"].value).toHslString();
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
    let borderHighContrast = colors["06-border-high-contrast"]?.value
      ? colord(colors["06-border-high-contrast"].value).toHslString()
      : "transparent";

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

    const alertUpdate = colord(colors["11-update-alert"].value).toHslString();
    const alertCritical = colord(
      colors["12-critical-alert"].value
    ).toHslString();
    const alertWarning = colord(colors["13-warning-alert"].value).toHslString();
    const alertInfo = colord(
      colors["14-information-alert"].value
    ).toHslString();
    const attentionDarkBg = colord(
      colors["15-icon-status"]?.value || 'blgh'
        // colors["15a-icon-status-on-dark-background"].value
    ).toHslString();
    const attentionLightBg = colord(
      colors["15-icon-status"]?.value || 'blg'
        // colors["15b-icon-status-on-light-background"].value
    ).toHslString();

    let toolbarFieldFocusBorder;
    switch (variantName) {
      case "soft":
        toolbarFieldFocusBorder = "rgba(0, 96, 223, 0.5)";
        break;
      case "balanced":
        toolbarFieldFocusBorder = "rgba(0, 179, 244, 1)"
        break;
      case "bold":
        toolbarFieldFocusBorder = "rgba(0, 221, 255, 0.7)";
        break;
    }

    console.log(variantName);
    const toolbarFieldBackground =
      variantName == "balanced" ? modalBackgroundTabAndSearch : frameColor;
    const chicletBackground =
      variantName == "balanced" ? frameColor : modalBackgroundTabAndSearch;

    // Manifest definition.
    let manifest = {
      manifest_version: 2,

      applications: {
        gecko: {
          id: `${idName}-colorway@mozilla.org`,
        },
      },

      name: displayName,
      author: "Mozilla",
      version: kVersionNumber,

      icons: { 32: "icon.svg" },

      theme: {
        properties: {
          color_scheme: variantName == "balanced" ? "light" : variantName == "soft" ? "light" : "dark",
          content_color_scheme: "auto"
        },
        colors: {
          tab_background_text: brightText,
          tab_text: darkText,
          tab_selected: modalBackgroundTabAndSearch,
          tab_line: borderHighContrast,
          tab_loading: attentionLightBg,
          tab_loading_inactive: attentionDarkBg,

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
          toolbar_field_border_focus: toolbarFieldFocusBorder,
          toolbar_top_separator: "transparent",
          toolbar_bottom_separator: frameColor,

          ntp_background: backgroundContent,
          ntp_card_background: modalBackgroundPrimary,
          ntp_text: darkText,

          sidebar: modalBackgroundPrimary,
          sidebar_text: darkText,
          sidebar_highlight: highlightRows,

          // Experimental properties follow.
          address_bar_box: chicletBackground,
          address_bar_box_hover: colord(chicletBackground)
            .alpha(colord(chicletBackground).alpha() - 0.2)
            .toHslString(),
          address_bar_box_active: colord(chicletBackground)
            .alpha(colord(chicletBackground).alpha() - 0.35)
            .toHslString(),
          address_bar_box_focus: toolbarColor,
          address_bar_box_text: brightText,
          address_bar_url_color: urlColor,
          panel_item_hover: highlightRows,
          panel_item_active: colord(highlightRows)
            .alpha(colord(highlightRows).alpha() + 0.15)
            .toHslString(),
          panel_separator: borderLowContrast,

          icons_attention: attentionDarkBg,
          toolbar_field_icons_attention: attentionLightBg,

          tab_attention_dot: alertUpdate,

          appmenu_update_icon_color: alertUpdate,
          appmenu_info_icon_color: alertInfo,
        },
      },
      theme_experiment: {
        colors: {
          address_bar_box: "--urlbar-box-bgcolor",
          address_bar_box_hover: "--urlbar-box-hover-bgcolor",
          address_bar_box_active: "--urlbar-box-active-bgcolor",
          address_bar_box_focus: "--urlbar-box-focus-bgcolor",
          address_bar_box_text: "--urlbar-box-text-color",
          address_bar_url_color: "--urlbar-popup-url-color",
          panel_item_hover: "--panel-item-hover-bgcolor",
          panel_item_active: "--panel-item-active-bgcolor",
          panel_separator: "--panel-separator-color",
          toolbar_field_icons_attention:
            "--lwt-toolbar-field-icon-fill-attention",
          tab_attention_dot: "--lwt-tab-attention-icon-color",
          appmenu_update_icon_color:
            "--panel-banner-item-update-supported-bgcolor",
          appmenu_info_icon_color: "--panel-banner-item-info-icon-bgcolor",
          tab_loading_inactive: "--lwt-tab-loading-fill-inactive",
        },
      },
    };

    // Create the folder structure.
    mkdir(`./themes/independent-voices/${colorName}`, (err) => {
      if (err) {
        console.warn(`Failed to create new directory: ${err}`);
      }
    });
    mkdir(`./themes/independent-voices/${colorName}/${variantName}`, (err) => {
      if (err) {
        console.warn(`Failed to create new directory: ${err}`);
      }
    });

    // Write the manifest file.
    const manifestOutput = JSON.stringify(manifest, null, 2).concat("\n");
    writeFile(
      `./themes/independent-voices/${colorName}/${variantName}/manifest.json`,
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
    writeFile(`./themes/independent-voices/${colorName}/${variantName}/icon.svg`, icon, (err) => {
      if (err) {
        console.log(err);
      }
    });

    // Create and write the preview image.
    const preview = borderHighContrast == "transparent"
? `<!-- This Source Code Form is subject to the terms of the Mozilla Public
  - License, v. 2.0. If a copy of the MPL was not distributed with this
  - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->
<svg width="680" height="92" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="92" fill="${frameColor}" />
  <g filter="url(#filter0_dd)">
    <rect x="28" y="5" width="166" height="34" rx="4" fill="${modalBackgroundTabAndSearch}" stroke="${borderHighContrast}" stroke-width="1.5" />
  </g>
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
  <defs>
  <filter id="filter0_dd" x="24" y="1" width="174" height="42" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix" />
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
    <feOffset />
    <feGaussianBlur stdDeviation="2" />
    <feColorMatrix type="matrix" values="0 0 0 0 0.501961 0 0 0 0 0.501961 0 0 0 0 0.556863 0 0 0 0.5 0" />
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
    <feOffset />
    <feGaussianBlur stdDeviation="0.5" />
    <feColorMatrix type="matrix" values="0 0 0 0 0.501961 0 0 0 0 0.501961 0 0 0 0 0.556863 0 0 0 0.9 0" />
    <feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow" />
    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
  </filter>
  </defs>
</svg>
`
: `<!-- This Source Code Form is subject to the terms of the Mozilla Public
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
    writeFile(
      `./themes/independent-voices/${colorName}/${variantName}/preview.svg`,
      preview,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    // Save the strings to be saved to jar.mn.
    // browser/themes/independent-voices/addons/jar.mn
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
        [
          `${idName}-colorway@mozilla.org`,
          {
            version: kVersionNumber,
            path: `monochromatic/${colorName}/${variantName}/`,
          },
        ],
        null,
        2
      )
    );
    aboutaddonsBuffer.push(`[
  "${idName}-colorway@mozilla.org",
  "resource://builtin-themes/monochromatic/${colorName}/${variantName}/preview.svg",
]`);
  }

  // Write metadata.
  mkdir(`./themes/independent-voices/metadata`, (err) => {
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
    `./themes/independent-voices/metadata/browser-themes-addons-jar.txt`,
    jarStr,
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );

  writeFile(
    `./themes/independent-voices/metadata/browser-glue.txt`,
    browserGlueBuffer.join(",\n"),
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
  writeFile(
    `./themes/independent-voices/metadata/aboutaddons.txt`,
    aboutaddonsBuffer.join(",\n"),
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
}

try {
  readFile("./input.json", "utf8", (err, data) => {
    if (err) {
      console.warn(`Failed to read file: ${err}`);
    }
    writeManifest(data);
  });
} catch (ex) {
  console.warn(`Failed to read file: ${ex}.`);
}
