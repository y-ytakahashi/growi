export const AttachmentType = {
  BRAND_LOGO: 'BRAND_LOGO',
  WIKI_PAGE: 'WIKI_PAGE',
  PROFILE_IMAGE: 'PROFILE_IMAGE',
} as const;

export type AttachmentType = typeof AttachmentType[keyof typeof AttachmentType];


export type ExpressHttpHeader<Field = string> = {
  field: Field,
  value: string | string[]
};

export type IContentHeaders = {
  contentType?: ExpressHttpHeader<'Content-Type'>;
  contentLength?: ExpressHttpHeader<'Content-Length'>;
  contentSecurityPolicy?: ExpressHttpHeader<'Content-Security-Policy'>;
  contentDisposition?: ExpressHttpHeader<'Content-Disposition'>;
}

export type RespondOptions = {
  download?: boolean,
}
