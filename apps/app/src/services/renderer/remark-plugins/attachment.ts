import path from 'path';

import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Link } from 'mdast';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

const SUPPORTED_ATTRIBUTES = ['attachmentId', 'url', 'attachmentName'];

const isAttachmentLink = (url: string): boolean => {
  // https://regex101.com/r/9qZhiK/1
  const attachmentUrlFormat = new RegExp(/^\/(attachment)\/([^/^\n]+)$/);
  return attachmentUrlFormat.test(url);
};

const rewriteNode = (node: Link) => {
  const attachmentId = path.basename(node.url as string);
  const data = node.data ?? (node.data = {});
  data.hName = 'attachment';
  data.hProperties = {
    attachmentId,
    url: node.url,
    attachmentName: node.children[0] ?? '',
  };
};


export const remarkPlugin: Plugin = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'link') {
        if (isAttachmentLink((node as Link).url as string)) {
          rewriteNode(node as Link);
        }
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['attachment'],
  attributes: {
    attachment: SUPPORTED_ATTRIBUTES,
  },
};
