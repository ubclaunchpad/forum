declare module "react-pdf/dist/esm/entry.webpack" {
  export { pdfjs, Document, Page } from "react-pdf";
}

interface Window {
  dialog: HTMLDialogElement;
}
