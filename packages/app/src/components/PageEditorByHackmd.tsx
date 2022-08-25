import React, {
  useCallback, useRef, useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import { getOptionsToSave } from '~/client/util/editor';
import { IResHackmdIntegrated, IResHackmdDiscard } from '~/interfaces/hackmd';
import {
  useCurrentPagePath, useCurrentPageId, useHackmdUri, usePageIdOnHackmd, useHasDraftOnHackmd, useRevisionIdHackmdSynced,
} from '~/stores/context';
import { useSWRxSlackChannels, useIsSlackEnabled, usePageTagsForEditors } from '~/stores/editor';
import { useSWRxCurrentPage } from '~/stores/page';
import {
  useEditorMode, useSelectedGrant,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import HackmdEditor from './PageEditorByHackmd/HackmdEditor';

const logger = loggerFactory('growi:PageEditorByHackmd');

type HackEditorRef = {
  getValue: () => string
};

export const PageEditorByHackmd = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: editorMode } = useEditorMode();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: pageId } = useCurrentPageId();
  const { data: pageTags, mutate: updatePageTagsForEditors } = usePageTagsForEditors(pageId);
  const { data: grant } = useSelectedGrant();
  const { data: hackmdUri } = useHackmdUri();

  // pageData
  const { data: pageData, mutate: updatePageData } = useSWRxCurrentPage();
  const revision = pageData?.revision;

  const slackChannels = slackChannelsData?.toString();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  // for error
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorReason, setErrorReason] = useState('');

  // state from pageContainer
  const { data: pageIdOnHackmd, mutate: updatePageIdOnHackmd } = usePageIdOnHackmd();
  const { data: hasDraftOnHackmd, mutate: updateHasDraftOnHackmd } = useHasDraftOnHackmd();
  const { data: revisionIdHackmdSynced, mutate: updateRevisionIdHackmdSynced } = useRevisionIdHackmdSynced();
  const [isHackmdDraftUpdatingInRealtime, setIsHackmdDraftUpdatingInRealtime] = useState(false);
  const [remoteRevisionId, setRemoteRevisionId] = useState(revision?._id); // initialize

  const hackmdEditorRef = useRef<HackEditorRef>(null);

  // useEffect(() => {
  //   const pageEditorByHackmdInstance = {
  //     getMarkdown: () => {
  //       if (!isInitialized) {
  //         return Promise.reject(new Error(t('hackmd.not_initialized')));
  //       }

  //       if (hackmdEditorRef.current == null) { return }

  //       return hackmdEditorRef.current.getValue();
  //     },
  //     reset: () => {
  //       setIsInitialized(false);
  //     },
  //   };
  //   appContainer.registerComponentInstance('PageEditorByHackmd', pageEditorByHackmdInstance);
  // }, [appContainer, isInitialized, t]);

  const isResume = useCallback(() => {
    const isPageExistsOnHackmd = (pageIdOnHackmd != null);
    return (isPageExistsOnHackmd && hasDraftOnHackmd) || isHackmdDraftUpdatingInRealtime;
  }, [hasDraftOnHackmd, isHackmdDraftUpdatingInRealtime, pageIdOnHackmd]);

  const startToEdit = useCallback(async() => {

    if (hackmdUri == null) {
      // do nothing
      return;
    }

    setIsInitialized(false);
    setIsInitializing(true);

    try {
      const res = await apiPost<IResHackmdIntegrated>('/hackmd.integrate', { pageId });

      if (!res.ok) {
        throw new Error(res.error);
      }

      updatePageIdOnHackmd(res.pageIdOnHackmd);
      updateRevisionIdHackmdSynced(res.revisionIdHackmdSynced);
    }
    catch (err) {
      toastError(err);

      setHasError(true);
      setErrorMessage('GROWI server failed to connect to HackMD.');
      setErrorReason(err.toString());
    }

    setIsInitialized(true);
    setIsInitializing(false);
  }, [pageId, hackmdUri, updatePageIdOnHackmd, updateRevisionIdHackmdSynced]);

  /**
   * Start to edit w/o any api request
   */
  const resumeToEdit = useCallback(() => {
    setIsInitialized(true);
  }, []);

  const discardChanges = useCallback(async() => {

    if (pageId == null) { return }

    try {
      const res = await apiPost<IResHackmdDiscard>('/hackmd.discard', { pageId });

      if (!res.ok) {
        throw new Error(res.error);
      }

      setIsHackmdDraftUpdatingInRealtime(false);
      updateHasDraftOnHackmd(false);
      updatePageIdOnHackmd(res.pageIdOnHackmd);
      setRemoteRevisionId(res.revisionIdHackmdSynced);
      updateRevisionIdHackmdSynced(res.revisionIdHackmdSynced);


    }
    catch (err) {
      logger.error(err);
      toastError(err);
    }
  }, [setIsHackmdDraftUpdatingInRealtime, updateHasDraftOnHackmd, updatePageIdOnHackmd, updateRevisionIdHackmdSynced, pageId]);

  /**
   * save and update state of containers
   * @param {string} markdown
   */
  const onSaveWithShortcut = useCallback(async(markdown) => {
    if (isSlackEnabled == null || grant == null || slackChannels == null || pageId == null || revisionIdHackmdSynced == null) { return }
    const optionsToSave = getOptionsToSave(
      isSlackEnabled, slackChannels, grant.grant, grant.grantedGroup?.id, grant.grantedGroup?.name, pageTags ?? [], true,
    );

    try {

      const params = Object.assign(optionsToSave, {
        page_id: pageId,
        revision_id: revisionIdHackmdSynced,
        body: markdown,
      });

      const res = await apiPost<any>('/pages.update', params);

      // update pageData
      updatePageData();

      // set updated data
      setRemoteRevisionId(res.revision._id);
      updateRevisionIdHackmdSynced(res.page.revisionHackmdSynced);
      updateHasDraftOnHackmd(res.page.hasDraftOnHackmd);
      updatePageTagsForEditors(res.tags);

      // call reset
      setIsInitialized(false);

      logger.debug('success to save');

      toastSuccess('Saved successfully');
    }
    catch (error) {
      logger.error('failed to save', error);
      toastError(error);
    }
  }, [
    grant, isSlackEnabled, pageTags, slackChannels, updatePageTagsForEditors, pageId,
    revisionIdHackmdSynced, updatePageData, updateHasDraftOnHackmd, updateRevisionIdHackmdSynced,
  ]);

  /**
   * onChange event of HackmdEditor handler
   */
  const hackmdEditorChangeHandler = useCallback(async(body) => {

    if (hackmdUri == null || pageId == null) {
      // do nothing
      return;
    }

    if (revision?.body === body) {
      return;
    }

    try {
      await apiPost('/hackmd.saveOnHackmd', { pageId });
    }
    catch (err) {
      logger.error(err);
    }
  }, [pageId, revision?.body, hackmdUri]);

  const penpalErrorOccuredHandler = useCallback((error) => {
    toastError(error);

    setHasError(true);
    setErrorMessage(t('hackmd.fail_to_connect'));
    setErrorReason(error.toString());
  }, [t]);

  const renderPreInitContent = useCallback(() => {
    const isPageNotFound = pageId == null;

    let content;

    /*
     * HackMD is not setup
     */
    if (hackmdUri == null) {
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> { t('hackmd.not_set_up')}</p>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('hackmd.need_to_associate_with_growi_to_use_hackmd_refer_to_this') }} />
        </div>
      );
    }

    /*
    * used HackMD from NotFound Page
    */
    else if (isPageNotFound) {
      content = (
        <div className="text-center">
          <p className="hackmd-status-label">
            <i className="fa fa-file-text mr-2" />
            { t('hackmd.used_for_not_found') }
          </p>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('hackmd.need_to_make_page') }} />
        </div>
      );
    }
    /*
     * Resume to edit or discard changes
     */
    else if (isResume()) {
      const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <p className="text-center"><strong>{t('hackmd.unsaved_draft')}</strong></p>

          { isHackmdDocumentOutdated && (
            <div className="card border-warning">
              <div className="card-header bg-warning"><i className="icon-fw icon-info"></i> {t('hackmd.draft_outdated')}</div>
              <div className="card-body text-center">
                {t('hackmd.based_on_revision')}&nbsp;
                <a href={`?revision=${revisionIdHackmdSynced}`}><span className="badge badge-secondary">{revisionIdHackmdSynced?.substr(-8)}</span></a>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link btn-view-outdated-draft p-0"
                    type="button"
                    disabled={isInitializing}
                    onClick={resumeToEdit}
                  >
                    {t('hackmd.view_outdated_draft')}
                  </button>
                </div>
              </div>
            </div>
          ) }

          { !isHackmdDocumentOutdated && (
            <div className="text-center hackmd-resume-button-container mb-3">
              <button
                className="btn btn-success btn-lg waves-effect waves-light"
                type="button"
                disabled={isInitializing}
                onClick={resumeToEdit}
              >
                <span className="btn-label"><i className="icon-fw icon-control-end"></i></span>
                <span className="btn-text">{t('hackmd.resume_to_edit')}</span>
              </button>
            </div>
          ) }

          <div className="text-center hackmd-discard-button-container mb-3">
            <button
              className="btn btn-outline-secondary btn-lg waves-effect waves-light"
              type="button"
              onClick={discardChanges}
            >
              <span className="btn-label"><i className="icon-fw icon-control-start"></i></span>
              <span className="btn-text">{t('hackmd.discard_changes')}</span>
            </button>
          </div>

        </div>
      );
    }
    /*
     * Start to edit
     */
    else {
      const isRevisionOutdated = revision?._id !== remoteRevisionId;

      content = (
        <div>
          <p className="text-muted text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <div className="text-center hackmd-start-button-container mb-3">
            <button
              className="btn btn-info btn-lg waves-effect waves-light"
              type="button"
              disabled={isRevisionOutdated || isInitializing}
              onClick={startToEdit}
            >
              <span className="btn-label"><i className="icon-fw icon-paper-plane"></i></span>
              {t('hackmd.start_to_edit')}
            </button>
          </div>
          <p className="text-center">{t('hackmd.clone_page_content')}</p>
        </div>
      );
    }

    return (
      <div className="hackmd-preinit d-flex justify-content-center align-items-center">
        {content}
      </div>
    );
  }, [discardChanges, isInitializing, isResume, resumeToEdit, startToEdit, t, hackmdUri, pageId, remoteRevisionId, revisionIdHackmdSynced, revision?._id]);

  if (editorMode == null || revision == null) {
    return <></>;
  }

  let content;

  // TODO: typescriptize
  // using any because ref cann't used between FC and class conponent with type safe
  const AnyEditor = HackmdEditor as any;

  if (isInitialized && hackmdUri != null) {
    content = (
      <AnyEditor
        ref={hackmdEditorRef}
        hackmdUri={hackmdUri}
        pageIdOnHackmd={pageIdOnHackmd}
        initializationMarkdown={isResume() ? null : revision.body}
        onChange={hackmdEditorChangeHandler}
        onSaveWithShortcut={(document) => {
          onSaveWithShortcut(document);
        }}
        onPenpalErrorOccured={penpalErrorOccuredHandler}
      >
      </AnyEditor>
    );
  }
  else {
    content = renderPreInitContent();
  }


  return (
    <div className="position-relative">

      {content}

      { hasError && (
        <div className="hackmd-error position-absolute d-flex flex-column justify-content-center align-items-center">
          <div className="bg-box p-5 text-center">
            <h2 className="text-warning"><i className="icon-fw icon-exclamation"></i> {t('hackmd.integration_failed')}</h2>
            <h4>{errorMessage}</h4>
            <p className="card well text-danger">
              {errorReason}
            </p>
            {/* eslint-disable-next-line react/no-danger */}
            <p dangerouslySetInnerHTML={{ __html: t('hackmd.check_configuration') }} />
          </div>
        </div>
      ) }

    </div>
  );

};
