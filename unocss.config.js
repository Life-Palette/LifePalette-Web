import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  // presetWebFonts,
  // transformerDirectives,
  // transformerVariantGroup,
} from "unocss";

export default defineConfig({
  shortcuts: [
    [
      "btn",
      "px-4 py-1 rounded inline-block bg-sky-600 text-white cursor-pointer hover:bg-sky-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50",
    ],
    [
      "icon-btn",
      "text-[1.2em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-sky-400 hover:scale-130 !outline-none",
    ],
    ["pr", "relative"],
    ["pa", "absolute"],
    ["pf", "fixed"],
    ["f-c", "flex justify-center items-center"],
    ["f-c-c", "f-c flex-col"],
    ["fc", "flex justify-center"],
    ["fcc", "flex justify-center items-center"],
    ["fs", "flex justify-start"],
    ["fsc", "flex justify-start items-center"],
    ["fe", "flex justify-end"],
    ["fec", "flex justify-end items-center"],
    ["fb", "flex justify-between"],
    ["fbc", "flex justify-between items-center"],
    ["fw", "flex justify-wrap"],
    ["fwr", "flex justify-wrap-reverse"],
    ["fa", "flex justify-around"],
    ["fac", "flex justify-around items-center"],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    // presetWebFonts({
    //   fonts: {
    //     sans: "DM Sans",
    //     serif: "DM Serif Display",
    //     mono: "DM Mono",
    //   },
    // }),
  ],
  // transformers: [
  //   transformerDirectives(),
  //   transformerVariantGroup(),
  // ],
});
