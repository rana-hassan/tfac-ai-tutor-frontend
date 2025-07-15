// components/utils/readability.js
export const readabilitySimplify = (input) => {
  // Return original input if falsy - no placeholder text
  if (!input || typeof input !== 'string') return input || '';
  
  return input
    .replace(/([^.]{120,}?)\. /g, '$1.↩')  // inject break marker
    .split('↩')
    .map(s => s.trim())
    .filter(Boolean)
    .join('. ');
};

export const highlightTerms = (text, glossary = []) => {
  if (!text || !glossary.length) return text;
  
  let result = text;
  
  // Sort glossary terms by length (longest first) to avoid partial matches
  const sortedTerms = glossary.sort((a, b) => b.term.length - a.term.length);
  
  sortedTerms.forEach(({ term }) => {
    // Only highlight the first occurrence of each term
    const regex = new RegExp(`\\b(${term})\\b`, 'i');
    if (regex.test(result) && !result.includes(`<strong>${term}</strong>`)) {
      result = result.replace(regex, `<strong>$1</strong>`);
    }
  });
  
  return result;
};

export const shouldUseBulletPoints = (text) => {
  return text && text.length > 120;
};