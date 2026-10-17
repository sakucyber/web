// @ts-check
/**
 * 构建期 Markdown 安全清洗插件（rehype）
 * ----------------------------------------------------------------
 * 站点内容虽然是本地 Markdown、构建期渲染，但仍然遵守「不信任输入」原则：
 * 即使以后接入外部稿件 / CMS，也不会把危险 HTML 带进最终页面。
 *
 * 处理内容：
 *  1. 移除 script / iframe / object / embed / form 等可执行或可交互标签；
 *  2. 移除所有 on* 事件属性与 srcdoc / formaction 等危险属性；
 *  3. 校验 href / src 协议，拒绝 javascript:、vbscript:、data:text/html 等；
 *  4. style 属性只保留在 Shiki 输出的 pre / code / span 上，且拒绝 expression() 等；
 *  5. 外链统一补 rel="noopener noreferrer" 与 target="_blank"。
 */

const BLOCKED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'meta',
  'link',
  'base',
  'frame',
  'frameset',
  'applet',
  'template',
  'noscript',
]);

const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'poster', 'cite', 'data']);

const SAFE_PROTOCOL = /^(https?:|mailto:|tel:|\/|#|\.{0,2}\/)/i;
const SAFE_DATA_IMAGE = /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp|x-icon);/i;
const SAFE_STYLE = /^(?!.*(?:expression\s*\(|javascript:|vbscript:|@import|behavior\s*:))/i;

/**
 * @param {string} value
 * @param {boolean} [allowDataImage]
 * @returns {boolean}
 */
function isSafeUrl(value, allowDataImage = false) {
  // 去掉 URL 里的空白与控制字符，防止 `java\nscript:` 之类的绕过；这是刻意为之
  // eslint-disable-next-line no-control-regex
  const url = value.trim().replace(/[\u0000-\u001f\u007f\s]+/g, '');
  if (!url) return false;
  if (url.startsWith('//')) return true; // 协议相对的外部链接
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    if (SAFE_PROTOCOL.test(url)) return true;
    if (allowDataImage && SAFE_DATA_IMAGE.test(url)) return true;
    return false;
  }
  // 没有协议的相对路径 / 锚点
  return !/^[a-z][a-z0-9+.-]*:/i.test(url);
}

/**
 * @param {any} node
 */
function sanitizeElement(node) {
  const tagName = String(node.tagName).toLowerCase();
  if (BLOCKED_TAGS.has(tagName)) {
    node.type = 'text';
    node.value = '';
    node.tagName = undefined;
    node.properties = undefined;
    node.children = undefined;
    return;
  }

  /** @type {Record<string, any>} */
  const props = node.properties ?? {};
  node.properties = props;

  for (const key of Object.keys(props)) {
    const lower = key.toLowerCase();
    // on* 事件处理器一律移除
    if (lower.startsWith('on') || lower === 'srcdoc' || lower === 'formaction') {
      delete props[key];
      continue;
    }
    if (URL_ATTRS.has(lower) && typeof props[key] === 'string') {
      const allowData = lower === 'src' && tagName === 'img';
      if (!isSafeUrl(String(props[key]), allowData)) {
        delete props[key];
      }
    }
    if (lower === 'style') {
      const allowed =
        (tagName === 'pre' || tagName === 'code' || tagName === 'span') &&
        SAFE_STYLE.test(String(props[key]));
      if (!allowed) delete props[key];
    }
  }

  // 外链：新窗口打开并阻断 window.opener
  if (tagName === 'a' && typeof props.href === 'string' && /^https?:\/\//i.test(props.href)) {
    props.rel = 'noopener noreferrer';
    props.target = '_blank';
  }

  // 图片必须带 alt，避免读屏器读到文件名
  if (tagName === 'img' && (props.alt === undefined || props.alt === null)) {
    props.alt = '';
  }
}

/**
 * @param {any} node
 */
function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element') {
    sanitizeElement(node);
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  } else if (node.type === 'root' && Array.isArray(node.children)) {
    for (const child of node.children) walk(child);
  }
}

/** @returns {(tree: any) => void} */
export function rehypeSafeMarkdown() {
  return (tree) => {
    walk(tree);
  };
}
