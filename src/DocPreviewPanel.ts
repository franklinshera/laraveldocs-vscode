import * as vscode from "vscode";
import { getDocContents, getNonce } from "./Utils";
import {
  COMPILED_DIR,
  CSS_ASSET,
  DOC_LOCATION,
  EXT_NAME,
  JS_ASSET,
  IMAGE_ASSET,
  EXT_ICON,
  ASSETS_DIR,
} from "./constants";

import type { IDocFile, IDocContents } from "./interfaces";

export default class DocPreviewPanel {
  public static currentPanel: DocPreviewPanel | undefined;

  public static readonly viewType = "DocPanel";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private _docFile: IDocFile;

  public static createOrShow(extensionUri: vscode.Uri, docFile: IDocFile) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DocPreviewPanel.currentPanel) {
      DocPreviewPanel.currentPanel._panel.dispose();
    }

    const panel = vscode.window.createWebviewPanel(
      DocPreviewPanel.viewType,
      docFile.title,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, COMPILED_DIR),
          vscode.Uri.joinPath(extensionUri, ASSETS_DIR),
        ],
      }
    );

    DocPreviewPanel.currentPanel = new DocPreviewPanel(
      panel,
      extensionUri,
      docFile
    );
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    docFile: IDocFile
  ) {
    DocPreviewPanel.currentPanel = new DocPreviewPanel(
      panel,
      extensionUri,
      docFile
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    docFile: IDocFile
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._docFile = docFile;

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    this._panel.webview.onDidReceiveMessage(
      ({ command, value }) => {
        switch (command) {
          case "get-doc-path":
            const _fullDoc: IDocContents = {
              title: this._docFile.title,
              link: this._docFile.link,
              filename: this._docFile.filename,
              contents: getDocContents(this._docFile.link),
            };

            this._panel.webview.postMessage({
              type: DOC_LOCATION,
              value: _fullDoc,
            });
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    DocPreviewPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;

    this._panel.title = EXT_NAME + ":" + this._docFile.title;

    this._panel.iconPath = vscode.Uri.joinPath(
      this._extensionUri,
      IMAGE_ASSET,
      EXT_ICON
    );
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    /**Scripts */
    const domPurifyScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, JS_ASSET, "dompurify.js")
    );
    const highlightScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, JS_ASSET, "highlight.js")
    );
    const bladeHighlightScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, JS_ASSET, "blade.js")
    );
    const markedScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, JS_ASSET, "marked.js")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, COMPILED_DIR, "preview.js")
    );

    /**Styles */
    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, CSS_ASSET, "reset.css")
    );
    const stylesVscodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, CSS_ASSET, "vscode.css")
    );
    const themeStylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, CSS_ASSET, "theme.css")
    );
    const highlightStylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, CSS_ASSET, "highlight.css")
    );
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, COMPILED_DIR, "preview.css")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="style-src ${webview.cspSource}; img-src  ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
        <link href="${highlightStylesUri}" rel="stylesheet">
        <link href="${themeStylesUri}" rel="stylesheet">
				<link href="${stylesVscodeUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
        
        <script nonce="${nonce}" >
        const ldvscode = acquireVsCodeApi();
        </script>
				<title>Doc Panel</title>
			</head>
			<body>		
   
      <script nonce="${nonce}" src="${domPurifyScriptUri}"></script>
      <script nonce="${nonce}" src="${highlightScriptUri}"></script>
      <script nonce="${nonce}" src="${markedScriptUri}"></script>
      <script nonce="${nonce}" src="${scriptUri}"></script>
      <script nonce="${nonce}" src="${bladeHighlightScriptUri}"></script>
			</body>
			</html>`;
  }
}
