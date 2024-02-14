import { useEffect } from 'react';

import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';
import { AcceptedUploadFileType } from '@growi/core';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';


const additionalExtensions: Extension[] = [
  scrollPastEnd(),
];


type Props = {
  acceptedUploadFileType?: AcceptedUploadFileType,
  onChange?: (value: string) => void,
  onComment?: () => void,
}

export const CodeMirrorEditorComment = (props: Props): JSX.Element => {
  const {
    acceptedUploadFileType,
    onComment, onChange,
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.COMMENT);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  // set handler to comment with ctrl/cmd + Enter key
  useEffect(() => {
    if (onComment == null) {
      return;
    }

    const keymapExtension = keymap.of([
      {
        key: 'Mod-Enter',
        preventDefault: true,
        run: () => {
          const doc = codeMirrorEditor?.getDoc();
          if (doc != null) {
            onComment();
          }
          return true;
        },
      },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(keymapExtension);

    return cleanupFunction;
  }, [codeMirrorEditor, onComment]);

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.COMMENT}
      acceptedUploadFileType={acceptedUploadFileType}
      onChange={onChange}
    />
  );
};
