import { defineConfig } from "vitepress";
import { name, description, ogUrl, ogImage } from "./meta";

export default defineConfig({
  title: "feathers-hooks-common",
  lastUpdated: true,
  description: "",
  head: [
    ["meta", { name: "theme-color", content: "#ae0bb1" }],
    ["link", { rel: "icon", href: "/feathers-hooks-common-logo.png" }],
    ["meta", { property: "og:title", content: name }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:url", content: ogUrl }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { name: "twitter:title", content: name }],
    ["meta", { name: "twitter:description", content: description }],
    ["meta", { name: "twitter:image", content: ogImage }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],
  themeConfig: {
    siteTitle: "feathers-hooks-common",
    editLink: {
      pattern:
        "https://github.com/feathersjs-ecosystem/feathers-hooks-common/edit/master/docs/:path",
    },
    lastUpdatedText: "Last Updated",
    socialLinks: [
      {
        icon: "twitter",
        link: "https://twitter.com/feathersjs",
      },
      {
        icon: "discord",
        link: "https://discord.gg/qa8kez8QBx",
      },
      {
        icon: "github",
        link: "https://github.com/feathersjs-ecosystem/feathers-hooks-common",
      },
    ],
    logo: "/feathers-hooks-common-logo.png",
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Overview", link: "/overview" },
          { text: "Hooks", link: "/hooks" },
          { text: "Utilities", link: "/utilities" },
          { text: "Migrating", link: "/migrating" },
          { text: "Guides", link: "/guides" },
        ],
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2016-present Feathers contributors",
    },
  },
});
