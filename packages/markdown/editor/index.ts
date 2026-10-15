export { EditorState, EditorSelection, SelectionRange, ChangeSet, Text, Transaction, Compartment, type Extension, type ChangeSpec } from '@codemirror/state';
export { EditorView, ViewUpdate, tooltips, scrollPastEnd, keymap, lineNumbers, drawSelection, rectangularSelection, crosshairCursor, dropCursor } from '@codemirror/view';
export { history, historyKeymap, defaultKeymap, indentWithTab, undo, redo, undoDepth, redoDepth } from '@codemirror/commands';
export { forceLinting, setDiagnostics, linter, lintGutter, type Diagnostic } from '@codemirror/lint';
export { closeBrackets, closeBracketsKeymap, CompletionContext, autocompletion } from "@codemirror/autocomplete";
export { search, searchKeymap, SearchQuery, SearchCursor } from '@codemirror/search'
export { MergeView } from '@codemirror/merge';
export { syntaxHighlighting, syntaxTree, indentUnit, bracketMatching } from '@codemirror/language';
export type { SyntaxNode, Tree } from '@lezer/common';
export { vueLanguage } from '@codemirror/lang-vue';
export { cssLanguage } from '@codemirror/lang-css';
export { json, jsonLanguage, jsonParseLinter } from '@codemirror/lang-json';
export { markdown, compareTree, markdownHighlightStyle } from './language';
export { createEditorExtensionToggler } from './utils';
export { spellcheck, spellcheckTheme } from './spellcheck';
export { highlightTodos } from './todos';
export { textAlignmentDecorations } from './textAlignDecorations';
export { underlineDecorations, underlineDecorationsPlugin } from './underlineDecorations';
export { jsonSchemaLinter } from './jsonSchemaLinter';
export { 
  toggleStrong, toggleEmphasis, toggleStrikethrough, toggleUnderline, toggleFootnote, toggleCodeText,
  toggleListUnordered, toggleListOrdered, toggleTaskList, toggleBlockQuote,
  toggleLink, insertCodeBlock, insertTable, insertText,
  isTypeInSelection, isTaskListInSelection, isUnderlineInSelection,
  setTextAlignment, getActiveTextAlignment, type TextAlignment,
  insertNewlineContinueMarkup
} from './commands';
export { setRemoteClients, remoteSelection } from './awareness';
export { setComments, commentsExtension } from './comments';
export { setSearchGlobalQuery, searchGlobalExtensions, CustomizedSearchPanel } from './search';
