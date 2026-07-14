/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-mortgage-product-page.js
  var import_mortgage_product_page_exports = {};
  __export(import_mortgage_product_page_exports, {
    default: () => import_mortgage_product_page_default
  });

  // tools/importer/parsers/hero-product.js
  function parse(element, { document }) {
    const bgEl = element.querySelector('.hidden-xs .bg[style*="background-image"], .bg[style*="background-image"]');
    let image = null;
    if (bgEl) {
      const match = bgEl.getAttribute("style").match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (match && match[1]) {
        image = document.createElement("img");
        image.src = match[1];
      }
    }
    const overlay = element.querySelector(".text_overlay") || element;
    const heading = overlay.querySelector("h1, h2, h3");
    const cta = overlay.querySelector('.btn_box a, a.btn, a[class*="btn"]');
    const subheading = Array.from(overlay.querySelectorAll(".visual_bottom p, p.s, p")).find((p) => p.textContent.trim() && !p.querySelector("a")) || null;
    if (image) {
      const altText = heading ? heading.textContent.trim() : "";
      image.setAttribute("alt", altText);
    }
    if (!image && !heading && !subheading && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = [];
    if (image) {
      imageCell.push(document.createComment(" field:image "));
      imageCell.push(image);
    }
    cells.push([imageCell]);
    const textCell = [document.createComment(" field:text ")];
    if (heading) textCell.push(heading);
    if (subheading) textCell.push(subheading);
    if (cta) {
      const cleanCta = document.createElement("a");
      cleanCta.setAttribute("href", cta.getAttribute("href") || "#");
      cleanCta.textContent = cta.textContent.trim();
      const p = document.createElement("p");
      p.appendChild(cleanCta);
      textCell.push(p);
    }
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse2(element, { document }) {
    const strip = element.querySelector('.pws_strip, [class*="strip"]') || element;
    const titles = strip.querySelector(".strip_titles") || strip;
    const heading = titles.querySelector("h1, h2, h3, h4");
    const description = Array.from(titles.querySelectorAll(".pws_rte p, p")).filter((p) => p.textContent.replace(/ /g, "").trim().length > 0);
    const cta = strip.querySelector('.strip_cta a, a.btn, a[class*="btn"]');
    if (!heading && description.length === 0 && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const col1 = [];
    if (heading) col1.push(heading);
    description.forEach((p) => col1.push(p));
    const col2 = [];
    if (cta) {
      const cleanCta = document.createElement("a");
      cleanCta.setAttribute("href", cta.getAttribute("href") || "#");
      cleanCta.textContent = cta.textContent.trim();
      col2.push(cleanCta);
    }
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/unicredit-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        ".optanon-alert-box-wrapper",
        '[id*="CookieConsent"]',
        '[class*="cookie"]',
        ".modal-backdrop",
        ".pws_overlay",
        // Header chrome that is not page content: the top banner (logo + primary
        // menu) and the "Passa a" accessibility skip bar. These belong to the
        // site header, not the imported page body.
        "#header",
        '[role="banner"]',
        "#pageInfo",
        ".accessibilityTab__link",
        // Carousel navigation controls ("Precedente" / "Successivo" arrows).
        // The single-slide CPI note is imported as plain text, so the swiper
        // arrow buttons carry no content value and would otherwise leak their
        // sr-only labels into the output.
        ".mySwiper__arrowIcontainer",
        "button.icon-back",
        "button.icon-forth"
      ]);
      element.querySelectorAll("span > span:only-child").forEach((span) => {
        span.replaceWith(span.textContent);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        ".pws_header",
        ".pws_footer",
        ".pws_nav",
        '[class*="breadcrumb"]',
        ".pws_breadcrumb",
        ".pws_search",
        ".site-search",
        ".back-to-top",
        ".pws_backtotop",
        ".skip-link",
        "script",
        "style",
        "noscript",
        "iframe",
        "link",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-tracking");
        el.removeAttribute("data-analytics");
      });
    }
  }

  // tools/importer/transformers/unicredit-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var FALLBACKS = {
    rc4: ["div.pws_hb.pws_hb_tab"],
    "rc5-hero": ["div.content_in > div.pws:nth-of-type(1)"],
    "rc5-intro": ["div.content_in > div.pws:nth-of-type(2)"],
    "rc5-insurance": ["div.content_in > div.pws:nth-of-type(3)"],
    "rc5-services": ["div.content_in > div.pws:nth-of-type(4)"],
    "rc5-cpi": ["div.pws_column.pws_two_column_alt.odd"],
    "rc5-strip": ["div.pws.pws_contains_strip"],
    "rc5-disclaimer": ["div.content_in > div.pws:nth-of-type(7)"]
  };
  function resolveSection(root, section) {
    const candidates = [];
    if (section.selector) candidates.push(section.selector);
    if (section.id && FALLBACKS[section.id]) candidates.push(...FALLBACKS[section.id]);
    for (const sel of candidates) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.beforeTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const document = element.ownerDocument;
    const resolved = sections.map((section) => ({
      section,
      el: resolveSection(element, section)
    }));
    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { section, el } = resolved[i];
      if (!el) continue;
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        el.after(metadataBlock);
      }
      if (i > 0) {
        const hr = document.createElement("hr");
        el.before(hr);
      }
    }
  }

  // tools/importer/import-mortgage-product-page.js
  var PAGE_TEMPLATE = {
    name: "mortgage-product-page",
    description: "UniCredit mortgage product detail page: title banner, product intro with conditions, insurance/services text sections, promotional strip/carousel, CTA card, and legal disclaimer.",
    urls: [
      "https://www.unicredit.it/it/privati/mutui/tutti-i-mutui/per-la-casa/mutuo-unicredit-finalita-acquisto.html"
    ],
    blocks: [
      {
        name: "hero-product",
        instances: ["#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(1)"]
      },
      {
        name: "columns-cta",
        instances: ["#accessibility-content > div.content_out > div.content_in > div.pws.pws_contains_strip"]
      }
    ],
    sections: [
      { id: "rc4", name: "Page Title", selector: "#accessibility-content > div.pws_hb.pws_hb_tab", style: null, blocks: [], defaultContent: ["#accessibility-content > div.pws_hb.pws_hb_tab h1"] },
      { id: "rc5-hero", name: "Product Hero Banner", selector: "#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(1)", style: null, blocks: ["hero-product"], defaultContent: [] },
      { id: "rc5-intro", name: "Product Intro & Conditions", selector: "#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(2)", style: null, blocks: [], defaultContent: ["#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(2)"] },
      { id: "rc5-insurance", name: "Insurance Policy", selector: "#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(3)", style: null, blocks: [], defaultContent: ["#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(3)"] },
      { id: "rc5-services", name: "Included Services", selector: "#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(4)", style: null, blocks: [], defaultContent: ["#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(4)"] },
      { id: "rc5-cpi", name: "CPI Note", selector: "#accessibility-content > div.content_out > div.content_in > div.pws_column.pws_two_column_alt.odd", style: "grey", blocks: [], defaultContent: ["#accessibility-content > div.content_out > div.content_in > div.pws_column.pws_two_column_alt.odd"] },
      { id: "rc5-strip", name: "Blue CTA Strip", selector: "#accessibility-content > div.content_out > div.content_in > div.pws.pws_contains_strip", style: "blue-cta", blocks: ["columns-cta"], defaultContent: [] },
      { id: "rc5-disclaimer", name: "Legal Disclaimer", selector: "#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(7)", style: "disclaimer", blocks: [], defaultContent: ["#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(7)"] }
    ]
  };
  var parsers = {
    "hero-product": parse,
    "columns-cta": parse2
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_mortgage_product_page_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_mortgage_product_page_exports);
})();
