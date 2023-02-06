/* Copyright 2020 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

// Public Suffix List: https://publicsuffix.org/list/
import psl from './psl.js';

const urlInput = document.querySelector('input#url');
const urlPartsDiv = document.querySelector('div#url-parts');

urlInput.oninput = () => {
  // https://www.example.com
  const urlText = urlInput.value;
  //  console.log(`urlText: ${urlText}`);
  // URL API allows URLs such as https://foo or https://f.
  // URLs like tv.tv are possible.
  if (!urlText || !urlText.match(/\w{2,}\.\w{2,}/)) {
    urlPartsDiv.innerHTML = '';
    return;
  }
  let url;
  try {
    url = new URL(urlText);
  } catch {
    try {
      // Hack to allow URLs without protocol.
      url = new URL(`https://${urlText}`);
    } catch {
      console.log(`${urlText} is not a valid URL`);
      return;
    }
  }

  const hash = url.hash;
  const hostname = url.hostname;
  const origin = url.origin;
  const search = url.search;
  let pathname = url.pathname;

  // Get filename.
  //Need to handle `example.com/foo` as opposed to `example.com/foo.html`
  const endPart = urlText.split('#').shift().
    split('?').shift().split('/').pop();
  // Need to handle URLs like `web.dev`: URL must have a `/` to have a filename.
  const filename = urlText.match(/\w\/\w/) && endPart.match(/\w+\.\w+/) ?
    endPart : '';

  // The URL API returns / for URLs without a pathname specified.
  // Only highlight / if it's at the end of a URL.
  if (pathname === '/' && !urlText.match(/\/$/)) {
    pathname = '';
  }

  const scheme =
    urlText.match(/^https:\/\//) ? 'https' :
    urlText.match(/^http:\/\//)  ? 'http'  : '';
  // Avoid a couple of common mistakes: single / or missing :
  if (scheme === '' &&
      urlText.match(/^https?:\/\w/) || urlText.match(/^https?:\w/) || urlText.match(/^https?\/\w/)) {
    urlPartsDiv.innerHTML = 'Scheme format not valid.';
    return;
  }

  // Get the eTLD and eTLD+1.
  let etld;
  let etld1;
  if (psl.some(el => {
    etld = el;
    return hostname.includes(el);
  })) {
    console.log(`etld found: "${etld}"`);
    const regExp = new RegExp(`\\w+\.${etld}`);
    etld1 = urlText.match(regExp)[0];
    console.log('etld+1:', etld1);
  }

  // Add span for the origin.
  // The origin contains the hostname (site), which contains the eTLD+1,
  // which contains the eTLD :).
  urlPartsDiv.innerHTML = urlText.replace(origin,
    `<span id="origin">${origin}</span>`);

  urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(hostname,
    `<span id="hostname">${hostname}</span>`);

  // If the URL uses an eTLD, add spans for eTLD+1 and eTLD.
  if (etld) {
    console.log('hostname:', hostname, 'etld1:', etld1);
     urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(etld1,
    `<span id="etld1">${etld1}</span>`);
     urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(etld,
    `<span id="etld">${etld}</span>`);
  }

  // Hack: if the pathname is / then highlight the / after the origin(not a / after the scheme).
  if (pathname === '/') {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(/\/$/,
      `<span id="pathname">/</span>`);
  } else if (pathname) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(pathname,
      `<span id="pathname">${pathname}</span>`);
  }

  if (filename) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(filename,
      `<span id="filename">${filename}</span>`);
  }
  if (hash) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(hash,
      `<span id="hash">${hash}</span>`);
  }
  if (scheme) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(scheme,
      `<span id="scheme">${scheme}</span>`);
  }
  // If the URL has a hash value *and* a search string,
  // the URL API (for hash) returns the hash and the search string.
  if (search && !hash) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(search,
      `<span id="search">${search}</span>`);
  }


}
