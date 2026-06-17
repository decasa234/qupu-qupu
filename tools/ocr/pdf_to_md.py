"""PDF -> Markdown via PaddleOCR PP-StructureV3.

Produces, per input PDF, an output folder containing:
  full.md   - concatenated markdown of all pages (text + figure references)
  imgs/     - extracted figure crops referenced by full.md

This is the OCR front-end for the competition past-paper extraction pipeline
(wmi-paper-conversion): PDF -> full.md (+imgs) -> parse questions.

Lean model config: the heavy formula / chart / doc-orientation / unwarp models
are disabled (kid-level papers are plain arithmetic that the text recognizer
handles; figures are extracted as image crops and redrawn later as SVG). This
keeps the model download small. Pass --full to enable everything.

Usage:
  uv run python pdf_to_md.py <input.pdf> <out_dir> [--full]
"""

import argparse
import os
import sys


def build_pipeline(full: bool):
    from paddleocr import PPStructureV3

    if full:
        return PPStructureV3()
    # Lean: layout + multilingual OCR + tables only.
    return PPStructureV3(
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_formula_recognition=False,
        use_chart_recognition=False,
    )


def convert(pdf_path: str, out_dir: str, full: bool) -> None:
    os.makedirs(out_dir, exist_ok=True)
    imgs_dir = os.path.join(out_dir, "imgs")
    os.makedirs(imgs_dir, exist_ok=True)

    pipeline = build_pipeline(full)
    print(f"[ocr] predicting {pdf_path} ...", flush=True)
    results = list(pipeline.predict(input=pdf_path))
    print(f"[ocr] {len(results)} page(s)", flush=True)

    page_md = []
    n_imgs = 0
    for res in results:
        md = res.markdown  # dict: {markdown_texts, markdown_images, ...}
        page_md.append(md)
        for rel_path, image in (md.get("markdown_images", {}) or {}).items():
            dest = os.path.join(out_dir, rel_path)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            image.save(dest)
            n_imgs += 1

    # Concatenate pages (handles cross-page text joins) if the helper exists.
    try:
        joined = pipeline.concatenate_markdown_pages(page_md)
        text = joined["markdown_texts"] if isinstance(joined, dict) else joined
    except Exception:
        text = "\n\n".join(
            (m.get("markdown_texts", "") if isinstance(m, dict) else str(m)) for m in page_md
        )

    md_path = os.path.join(out_dir, "full.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"[ocr] wrote {md_path} ({len(text)} chars), {n_imgs} image(s) in {imgs_dir}", flush=True)


def main() -> int:
    ap = argparse.ArgumentParser(description="PDF -> Markdown via PP-StructureV3")
    ap.add_argument("pdf")
    ap.add_argument("out_dir")
    ap.add_argument("--full", action="store_true", help="enable all sub-models (formula, chart, orientation)")
    args = ap.parse_args()
    if not os.path.isfile(args.pdf):
        print(f"not a file: {args.pdf}", file=sys.stderr)
        return 1
    convert(args.pdf, args.out_dir, args.full)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
