import type { SVGProps } from "react";
import { Globe2, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { SocialPlatform } from "@/lib/brand";

/** Real WhatsApp brand glyph — lucide-react has no WhatsApp icon, so this is inlined. */
export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.257.593 4.457 1.72 6.39L3.2 28.8l6.59-1.68a12.75 12.75 0 0 0 6.213 1.583h.006c7.068 0 12.8-5.73 12.8-12.8 0-3.42-1.332-6.635-3.75-9.053a12.72 12.72 0 0 0-9.055-3.65Zm0 23.42h-.005a10.6 10.6 0 0 1-5.404-1.48l-.388-.23-3.91.996 1.045-3.812-.253-.39a10.598 10.598 0 0 1-1.625-5.664c0-5.874 4.782-10.65 10.658-10.65a10.6 10.6 0 0 1 7.54 3.122 10.578 10.578 0 0 1 3.117 7.537c0 5.876-4.783 10.65-10.775 10.65Zm5.845-7.976c-.32-.16-1.9-.938-2.194-1.045-.294-.107-.508-.16-.722.16-.213.32-.827 1.045-1.014 1.26-.187.213-.373.24-.693.08-.32-.16-1.35-.498-2.573-1.588-.951-.848-1.593-1.895-1.78-2.215-.187-.32-.02-.493.14-.653.144-.144.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.722-1.742-.99-2.386-.26-.625-.526-.54-.722-.55l-.615-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.666 0 1.573 1.147 3.093 1.307 3.307.16.213 2.257 3.446 5.467 4.833.764.33 1.36.527 1.826.674.767.244 1.465.21 2.017.127.615-.092 1.9-.777 2.167-1.527.267-.75.267-1.393.187-1.527-.08-.133-.293-.213-.613-.373Z" />
    </svg>
  );
}

export function socialIcon(platform: SocialPlatform, size = 19) {
  switch (platform) {
    case "whatsapp":
      return <WhatsAppIcon width={size} height={size} />;
    case "instagram":
      return <Instagram size={size} />;
    case "facebook":
      return <Facebook size={size} />;
    case "linkedin":
      return <Linkedin size={size} />;
    case "youtube":
      return <Youtube size={size} />;
    case "tiktok":
      return <TikTokIcon width={size} height={size} />;
    case "snapchat":
      return <SnapchatIcon width={size} height={size} />;
    case "x":
      return <XIcon width={size} height={size} />;
    default:
      return <Globe2 size={size} />;
  }
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.15-1.4V15.4a4.6 4.6 0 1 1-3.98-4.55v2.42a2.2 2.2 0 1 0 1.55 2.1V2h2.4a4.27 4.27 0 0 0 3.9 4.24v2.4a6.6 6.6 0 0 1-3.9-1.27V5.82Z" />
    </svg>
  );
}

function SnapchatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2c2.8 0 4.6 2 4.75 4.6l.05 1.53c.02.3.05.35.32.4.3.06 1.06-.24 1.4-.38.17-.07.36-.13.53-.02.2.13.28.4.16.68-.24.56-1.16 1-1.72 1.24-.16.07-.36.15-.36.34 0 .16.13.5.35 1.06.6 1.55 1.68 2.5 3.2 3 .2.06.4.24.3.5-.14.4-1.1.72-1.83.88-.14.03-.2.14-.24.28-.05.2-.1.5-.16.7-.06.2-.2.28-.4.26-.4-.04-1.1-.2-1.85-.2-.6 0-1 .2-1.5.5-.7.42-1.5.9-2.9.9s-2.2-.48-2.9-.9c-.5-.3-.9-.5-1.5-.5-.75 0-1.45.16-1.85.2-.2.02-.34-.06-.4-.26-.06-.2-.1-.5-.16-.7-.04-.14-.1-.25-.24-.28-.73-.16-1.7-.48-1.83-.88-.1-.26.1-.44.3-.5 1.52-.5 2.6-1.45 3.2-3 .22-.56.35-.9.35-1.06 0-.19-.2-.27-.36-.34-.56-.24-1.48-.68-1.72-1.24-.12-.28-.04-.55.16-.68.17-.11.36-.05.53.02.34.14 1.1.44 1.4.38.27-.05.3-.1.32-.4l.05-1.53C7.4 4 9.2 2 12 2Z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18.24 2.75h3.28l-7.17 8.19 8.44 10.31h-6.61l-5.18-6.6-5.93 6.6H1.79l7.66-8.75L1.36 2.75h6.78l4.68 6.03 5.42-6.03Zm-1.15 16.6h1.82L7.02 4.6H5.06l12.03 14.75Z" />
    </svg>
  );
}
