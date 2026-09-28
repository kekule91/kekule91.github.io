import { useEffect, useState } from "react";
import { cx } from "@/lib/cn";
import type { Ecc, InkId, Margin } from "@/lib/pages";
import { INKS } from "@/lib/pages";
import { qrDataUrl } from "@/lib/qr";

type QrImageProps = {
  text: string;
  ink: InkId;
  margin: Margin;
  ecc: Ecc;
  size?: number;
  className?: string;
  alt: string;
};

export function QrImage({ text, ink, margin, ecc, size = 480, className, alt }: QrImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setFailed(false);
    const colors = INKS[ink];
    qrDataUrl(text, { fg: colors.fg, bg: colors.bg, margin, ecc }, size)
      .then((url) => {
        if (live) setSrc(url);
      })
      .catch(() => {
        if (live) {
          setSrc(null);
          setFailed(true);
        }
      });
    return () => {
      live = false;
    };
  }, [text, ink, margin, ecc, size]);

  if (failed) {
    return (
      <div className={cx("grid place-items-center px-4 text-center text-sm", className)}>
        No se pudo crear el código. Prueba con un enlace más corto.
      </div>
    );
  }

  if (!src) {
    return <div className={cx("motion-safe:animate-pulse rounded-lg bg-soft", className)} />;
  }

  return <img src={src} alt={alt} className={cx("h-auto w-full", className)} />;
}
