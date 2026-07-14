/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UniCredit section breaks and section metadata.
 *
 * Uses the section definitions from the page template
 * (`payload.template.sections`) to:
 *   - insert an <hr> before every section except the first (section breaks)
 *   - append a "Section Metadata" block for every section that has a `style`
 *
 * The template `selector` values are absolute paths rooted at
 * `#accessibility-content` (captured DOM). Because the importer scopes the
 * transform to an extracted `main` element that may not preserve those
 * `#container > #wrapper > #accessibility-content` ancestors, each section is
 * resolved with a wrapper-independent fallback selector built from the same
 * distinguishing classes / positions verified against the live page DOM.
 *
 * Runs in beforeTransform, BEFORE block parsers replace their source elements.
 * Block parsers call element.replaceWith(table); if this ran afterwards, the
 * hero (`.pws:nth-of-type(1)`) and strip (`.pws.pws_contains_strip`) anchors
 * would already be gone — breaking the strip's `blue-cta` metadata and shifting
 * every `:nth-of-type` index. Inserting the <hr> breaks and Section Metadata
 * blocks first means they sit between the source elements and survive the
 * in-place table replacement the parsers perform.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Wrapper-independent fallbacks keyed by template section id (from captured DOM).
// Verified on the live page: div.pws direct children of .content_in are, in order,
// hero, intro, insurance, services, blue strip, disclaimer (carousel/CPI is a
// separate .pws_column between services and strip).
const FALLBACKS = {
  rc4: ['div.pws_hb.pws_hb_tab'],
  'rc5-hero': ['div.content_in > div.pws:nth-of-type(1)'],
  'rc5-intro': ['div.content_in > div.pws:nth-of-type(2)'],
  'rc5-insurance': ['div.content_in > div.pws:nth-of-type(3)'],
  'rc5-services': ['div.content_in > div.pws:nth-of-type(4)'],
  'rc5-cpi': ['div.pws_column.pws_two_column_alt.odd'],
  'rc5-strip': ['div.pws.pws_contains_strip'],
  'rc5-disclaimer': ['div.content_in > div.pws:nth-of-type(7)'],
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
      /* invalid selector in this context – try next */
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const document = element.ownerDocument;

  const resolved = sections.map((section) => ({
    section,
    el: resolveSection(element, section),
  }));

  // Process in reverse so inserted nodes do not shift earlier indices.
  for (let i = resolved.length - 1; i >= 0; i -= 1) {
    const { section, el } = resolved[i];
    if (!el) continue;

    // Section Metadata block for sections that carry a style (blue-cta, disclaimer).
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      el.after(metadataBlock);
    }

    // Section break before every section except the first.
    if (i > 0) {
      const hr = document.createElement('hr');
      el.before(hr);
    }
  }
}
