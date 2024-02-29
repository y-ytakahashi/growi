import type {
  IPageHasId, IRevisionHasId, ITag,
} from '@growi/core';

import type { IOptionsForCreate, IOptionsForUpdate } from '../page';

export type IApiv3PageCreateParams = IOptionsForCreate & {
  path?: string,
  parentPath?: string,
  optionalParentPath?: string,

  body?: string,
  pageTags?: string[],

  isSlackEnabled?: boolean,
  slackChannels?: string,
};

export type IApiv3PageCreateResponse = {
  page: IPageHasId,
  tags: ITag[],
  revision: IRevisionHasId,
};

export const Origin = {
  View: 'view',
  Editor: 'editor',
} as const;

export type Origin = typeof Origin[keyof typeof Origin];

export type IApiv3PageUpdateParams = IOptionsForUpdate & {
  pageId: string,
  revisionId?: string,
  body: string,

  origin?: Origin,
  isSlackEnabled?: boolean,
  slackChannels?: string,
};

export type IApiv3PageUpdateResponse = {
  page: IPageHasId,
  revision: IRevisionHasId,
};
