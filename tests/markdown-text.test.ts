import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownText } from '../src/components/MarkdownText';

test('renders markdown links and plain text', () => {
  const html = renderToStaticMarkup(
    React.createElement(MarkdownText, null, 'See [the event](https://example.com) for details.'),
  );

  assert.match(html, /<a[^>]+href="https:\/\/example\.com"/);
  assert.match(html, /See/);
  assert.match(html, /details/);
});
