import * as vscode from "vscode";
import Generator from "./Generator";
import SidebarProvider from "./SidebarProvider";

export function activate(context: vscode.ExtensionContext) {
  Generator.renderHtml();

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("docs-list", sidebarProvider)
  );
}

export function deactivate() {}
