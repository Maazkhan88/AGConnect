"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export function ProfileShareButton({name,title}:{name:string;title:string}){
  const [copied,setCopied]=useState(false);
  async function share(){
    const data={title:`${name} · ${title}`,text:`Connect with ${name}, ${title}.`,url:window.location.href};
    try{
      if(navigator.share){await navigator.share(data);return;}
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(()=>setCopied(false),1800);
    }catch(error){if(error instanceof DOMException&&error.name==="AbortError")return;}
  }
  return <button type="button" onClick={share} aria-label={`Share ${name}'s profile`}><Share2 size={19}/><span aria-live="polite">{copied?"Copied":""}</span></button>;
}
