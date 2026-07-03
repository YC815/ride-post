import { toPng } from "html-to-image";

/** 以節點本身尺寸 2 倍解析度匯出 PNG；data-export-exclude 的元素（如安全區輔助線）不會進圖 */
export async function exportPosterPng(node: HTMLElement, filename: string): Promise<void> {
  await document.fonts.ready;
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: false,
    filter: (n) => !(n instanceof HTMLElement && n.dataset.exportExclude !== undefined),
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  a.click();
}

export async function waitFor(cond: () => boolean, timeoutMs = 12000): Promise<void> {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > timeoutMs) return;
    await new Promise((r) => setTimeout(r, 150));
  }
}
