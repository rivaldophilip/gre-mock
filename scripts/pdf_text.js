#!/usr/bin/osascript -l JavaScript
// Extract per-page text from a PDF with macOS PDFKit.
// usage: osascript -l JavaScript scripts/pdf_text.js <in.pdf> <outdir>
// writes <outdir>/p0001.txt ...  (outdir must NOT be inside the public repo)
ObjC.import("PDFKit");
ObjC.import("Foundation");
function run(argv) {
  const [inPath, outDir] = argv;
  const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(inPath));
  if (!doc) throw new Error("cannot open " + inPath);
  const fm = $.NSFileManager.defaultManager;
  fm.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(outDir, true, $(), $());
  const n = doc.pageCount;
  for (let i = 0; i < n; i++) {
    const s = doc.pageAtIndex(i).string;
    let t = s ? ObjC.unwrap(s) : "";
    if (typeof t !== "string") t = "";
    const txt = $.NSString.stringWithString(t);
    const name = outDir + "/p" + String(i + 1).padStart(4, "0") + ".txt";
    txt.writeToFileAtomicallyEncodingError(name, true, $.NSUTF8StringEncoding, $());
  }
  return "pages: " + n;
}
