import { toDataURL, toString as qrToString } from "qrcode";
import type { Ecc, Margin } from "@/lib/pages";

export type QrStyle = {
  fg: string;
  bg: string;
  margin: Margin;
  ecc: Ecc;
};

const cache = new Map<string, string>();

function remember(key: string, value: string) {
  cache.set(key, value);
  if (cache.size > 80) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

export async function qrDataUrl(text: string, style: QrStyle, size: number): Promise<string> {
  const key = `${size}|${style.ecc}|${style.margin}|${style.fg}|${style.bg}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const url = await toDataURL(text, {
    width: size,
    margin: style.margin,
    errorCorrectionLevel: style.ecc,
    color: { dark: style.fg, light: style.bg },
  });
  remember(key, url);
  return url;
}

export async function qrSvg(text: string, style: QrStyle): Promise<string> {
  return qrToString(text, {
    type: "svg",
    margin: style.margin,
    errorCorrectionLevel: style.ecc,
    color: { dark: style.fg, light: style.bg },
  });
}

type AndroidBridge = {
  saveFile(name: string, mime: string, base64: string): void;
  print(): void;
  copyText(text: string): void;
};

// Presente solo dentro del APK (ver pliego-android/MainActivity.java).
export const androidBridge = (globalThis as { AndroidBridge?: AndroidBridge }).AndroidBridge;

export function downloadUrl(href: string, filename: string) {
  if (androidBridge) {
    // fetch() toma la URL blob: al invocarse, así que el llamador puede revocarla enseguida.
    void fetch(href)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const data = String(reader.result);
              androidBridge.saveFile(filename, blob.type || "application/octet-stream", data.slice(data.indexOf(",") + 1));
              resolve();
            };
            reader.readAsDataURL(blob);
          }),
      );
    return;
  }
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
