import test from "node:test";
import assert from "node:assert/strict";
import {
  escapeHtml,
  plainTextToSafeHtml,
  sanitizeTrustedHtml
} from "../../src/shared/html/sanitizeHtml.js";

test("escapeHtml escapes executable markup characters", () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert('x')">&`),
    "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;"
  );
});

test("plainTextToSafeHtml wraps escaped lines as paragraphs", () => {
  assert.equal(
    plainTextToSafeHtml("第一段\n<script>alert(1)</script>"),
    "<p>第一段</p><p>&lt;script&gt;alert(1)&lt;/script&gt;</p>"
  );
});

test("sanitizeTrustedHtml removes script blocks and inline event handlers", () => {
  assert.equal(
    sanitizeTrustedHtml(`<p onclick="bad()">内容</p><script>alert(1)</script>`),
    "<p>内容</p>"
  );
});
