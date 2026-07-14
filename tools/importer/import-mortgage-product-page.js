/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroProductParser from './parsers/hero-product.js';
import columnsCtaParser from './parsers/columns-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/unicredit-cleanup.js';
import sectionsTransformer from './transformers/unicredit-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'mortgage-product-page',
  description: 'UniCredit mortgage product detail page: title banner, product intro with conditions, insurance/services text sections, promotional strip/carousel, CTA card, and legal disclaimer.',
  urls: [
    'https://www.unicredit.it/it/privati/mutui/tutti-i-mutui/per-la-casa/mutuo-unicredit-finalita-acquisto.html',
  ],
  blocks: [
    {
      name: 'hero-product',
      instances: ['#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(1)'],
    },
    {
      name: 'columns-cta',
      instances: ['#accessibility-content > div.content_out > div.content_in > div.pws.pws_contains_strip'],
    },
  ],
  sections: [
    { id: 'rc4', name: 'Page Title', selector: '#accessibility-content > div.pws_hb.pws_hb_tab', style: null, blocks: [], defaultContent: ['#accessibility-content > div.pws_hb.pws_hb_tab h1'] },
    { id: 'rc5-hero', name: 'Product Hero Banner', selector: '#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(1)', style: null, blocks: ['hero-product'], defaultContent: [] },
    { id: 'rc5-intro', name: 'Product Intro & Conditions', selector: '#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(2)', style: null, blocks: [], defaultContent: ['#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(2)'] },
    { id: 'rc5-insurance', name: 'Insurance Policy', selector: '#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(3)', style: null, blocks: [], defaultContent: ['#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(3)'] },
    { id: 'rc5-services', name: 'Included Services', selector: '#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(4)', style: null, blocks: [], defaultContent: ['#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(4)'] },
    { id: 'rc5-cpi', name: 'CPI Note', selector: '#accessibility-content > div.content_out > div.content_in > div.pws_column.pws_two_column_alt.odd', style: 'grey', blocks: [], defaultContent: ['#accessibility-content > div.content_out > div.content_in > div.pws_column.pws_two_column_alt.odd'] },
    { id: 'rc5-strip', name: 'Blue CTA Strip', selector: '#accessibility-content > div.content_out > div.content_in > div.pws.pws_contains_strip', style: 'blue-cta', blocks: ['columns-cta'], defaultContent: [] },
    { id: 'rc5-disclaimer', name: 'Legal Disclaimer', selector: '#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(7)', style: 'disclaimer', blocks: [], defaultContent: ['#accessibility-content > div.content_out > div.content_in > div.pws:nth-of-type(7)'] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-product': heroProductParser,
  'columns-cta': columnsCtaParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
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

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
