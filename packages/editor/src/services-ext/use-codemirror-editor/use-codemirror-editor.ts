import { useMemo } from 'react';

import type {
  EditorState,
} from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';
import deepmerge from 'ts-deepmerge';

import { useAppendExtensions, type AppendExtensions } from './utils/append-extensions';
import { useFocus, type Focus } from './utils/focus';
import type { FoldDrawio } from './utils/fold-drawio';
import { useFoldDrawio } from './utils/fold-drawio';
import { useGetDoc, type GetDoc } from './utils/get-doc';
import { useInitDoc, type InitDoc } from './utils/init-doc';
import { useInsertMarkdownElements, type InsertMarkdowElements } from './utils/insert-markdown-elements';
import { useInsertPrefix, type InsertPrefix } from './utils/insert-prefix';
import { useInsertText, type InsertText } from './utils/insert-text';
import { useReplaceText, type ReplaceText } from './utils/replace-text';
import { useSetCaretLine, type SetCaretLine } from './utils/set-caret-line';


type UseCodeMirrorEditorUtils = {
  initDoc: InitDoc,
  appendExtensions: AppendExtensions,
  getDoc: GetDoc,
  focus: Focus,
  setCaretLine: SetCaretLine,
  insertText: InsertText,
  replaceText: ReplaceText,
  insertMarkdownElements: InsertMarkdowElements,
  insertPrefix: InsertPrefix,
  foldDrawio: FoldDrawio,
}
export type UseCodeMirrorEditor = {
  state: EditorState | undefined;
  view: EditorView | undefined;
} & UseCodeMirrorEditorUtils;


export const useCodeMirrorEditor = (props?: UseCodeMirror): UseCodeMirrorEditor => {

  const mergedProps = useMemo(() => {
    return deepmerge(
      props ?? {},
      {
        // Reset settings of react-codemirror.
        // Extensions are defined first will be used if they have the same priority.
        // If extensions conflict, disable them here.
        // And add them to defaultExtensions: Extension[] with a lower priority.
        // ref: https://codemirror.net/examples/config/
        // ------- Start -------
        indentWithTab: false,
        basicSetup: {
          defaultKeymap: false,
          dropCursor: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          // Disabled react-codemirror history for Y.UndoManager
          history: false,
        },
        // ------- End -------
      },
    );
  }, [props]);

  const { state, view } = useCodeMirror(mergedProps);

  const initDoc = useInitDoc(view);
  const appendExtensions = useAppendExtensions(view);
  const getDoc = useGetDoc(view);
  const focus = useFocus(view);
  const setCaretLine = useSetCaretLine(view);
  const insertText = useInsertText(view);
  const replaceText = useReplaceText(view);
  const insertMarkdownElements = useInsertMarkdownElements(view);
  const insertPrefix = useInsertPrefix(view);
  const foldDrawio = useFoldDrawio(view);

  return {
    state,
    view,
    initDoc,
    appendExtensions,
    getDoc,
    focus,
    setCaretLine,
    insertText,
    replaceText,
    insertMarkdownElements,
    insertPrefix,
    foldDrawio,
  };
};
