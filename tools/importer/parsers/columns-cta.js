/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta. Base block: columns (core/franklin/components/columns).
 * Source: https://www.unicredit.it/it/privati/mutui/tutti-i-mutui/per-la-casa/mutuo-unicredit-finalita-acquisto.html
 * Project type: xwalk.
 *
 * Model (blocks/columns-cta/_columns-cta.json): 2 columns x 1 row.
 * IMPORTANT: Columns blocks do NOT use field-hint comments (hinting.md Rule 4 /
 * Block Types). Cells hold default content only.
 *
 * Live DOM: the strip has `.strip_titles` (heading + rich-text description) and
 * `.strip_cta` (CTA anchor). Column 1 = titles, Column 2 = CTA button.
 */
export default function parse(element, { document }) {
  // Scope to the strip so we don't pick up wrapper noise
  const strip = element.querySelector('.pws_strip, [class*="strip"]') || element;

  // Column 1: heading + descriptive rich text
  const titles = strip.querySelector('.strip_titles') || strip;
  const heading = titles.querySelector('h1, h2, h3, h4');
  // Description: non-empty paragraphs from the rich-text area (skip empty &nbsp; paragraphs)
  const description = Array.from(titles.querySelectorAll('.pws_rte p, p'))
    .filter((p) => p.textContent.replace(/ /g, '').trim().length > 0);

  // Column 2: CTA button
  const cta = strip.querySelector('.strip_cta a, a.btn, a[class*="btn"]');

  // Empty-block guard
  if (!heading && description.length === 0 && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build Column 1 content
  const col1 = [];
  if (heading) col1.push(heading);
  description.forEach((p) => col1.push(p));

  // Build Column 2 content (rebuild a clean anchor; source carries inline handlers)
  const col2 = [];
  if (cta) {
    const cleanCta = document.createElement('a');
    cleanCta.setAttribute('href', cta.getAttribute('href') || '#');
    cleanCta.textContent = cta.textContent.trim();
    col2.push(cleanCta);
  }

  // 2 columns x 1 row: single content row with two cells.
  const cells = [[col1, col2]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
