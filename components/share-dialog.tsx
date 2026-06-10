"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { Check, Copy, Mail, MessageSquareText, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ── Brand glyphs (inline so we don't pull in an icon dependency) ── */

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.752-.245-1.349-.378-1.297-.797.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
      <path d="M.001 11.639C.001 4.95 5.241 0 12 0s11.999 4.95 11.999 11.639c0 6.689-5.24 11.638-11.999 11.638-1.21 0-2.371-.16-3.46-.46a.961.961 0 0 0-.64.05l-2.39 1.05a.96.96 0 0 1-1.35-.85l-.07-2.14a.97.97 0 0 0-.32-.68A11.39 11.389 0 0 1 .001 11.639zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.86 0l2.8 2.1c.84.63 2.02.4 2.6-.5l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.26.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 0 0-2.6.5z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/* ── Channel definitions ── */

type Channel = {
  key: string;
  label: string;
  icon: ReactNode;
  /** circle background (tailwind class) */
  ring: string;
  /** brand colour as inline style when not a tailwind token */
  style?: React.CSSProperties;
  iconClass?: string;
  href: (ctx: { url: string; caption: string; message: string }) => string;
};

const CHANNELS: Channel[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: <WhatsAppIcon />,
    ring: "",
    style: { backgroundColor: "#25D366" },
    href: ({ message }) => `https://wa.me/?text=${encodeURIComponent(message)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: <TelegramIcon />,
    ring: "",
    style: { backgroundColor: "#229ED9" },
    href: ({ url, caption }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(caption)}`,
  },
  {
    key: "messenger",
    label: "Messenger",
    icon: <MessengerIcon />,
    ring: "",
    style: { backgroundImage: "linear-gradient(45deg, #0695FF, #A334FA)" },
    href: ({ url }) => `fb-messenger://share/?link=${encodeURIComponent(url)}`,
  },
  {
    key: "x",
    label: "X",
    icon: <XIcon />,
    ring: "bg-foreground",
    iconClass: "text-background",
    href: ({ url, caption }) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: <FacebookIcon />,
    ring: "",
    style: { backgroundColor: "#1877F2" },
    href: ({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "email",
    label: "Email",
    icon: <Mail className="size-6" />,
    ring: "",
    style: { backgroundColor: "#64748B" },
    href: ({ message }) =>
      `mailto:?subject=${encodeURIComponent("Join me on Datta")}&body=${encodeURIComponent(message)}`,
  },
  {
    key: "sms",
    label: "SMS",
    icon: <MessageSquareText className="size-6" />,
    ring: "",
    style: { backgroundColor: "#16A34A" },
    href: ({ message }) => `sms:?&body=${encodeURIComponent(message)}`,
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.85 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 420, damping: 26 } },
};

// Client-only capability check that stays consistent with SSR (server → false),
// avoiding a hydration mismatch without a setState-in-effect.
const subscribeNoop = () => () => {};
const getNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const getNativeShareServer = () => false;

function openShare(href: string) {
  if (typeof window === "undefined") return;
  // App/protocol schemes need a same-tab navigation; web intents open in a new tab.
  if (/^(mailto:|sms:|fb-messenger:)/.test(href)) {
    window.location.href = href;
  } else {
    window.open(href, "_blank", "noopener,noreferrer");
  }
}

export function ShareDialog({
  open,
  onOpenChange,
  code,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(subscribeNoop, getNativeShare, getNativeShareServer);

  // Carry the code in the link too, so URL-only channels (Facebook, Telegram's
  // url param) still convey it even when they strip custom text.
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = origin ? `${origin}/?ref=${encodeURIComponent(code)}` : "";
  const caption = `Join me on Datta! Use my referral code ${code} when you sign up.`;
  const message = url ? `${caption} ${url}` : caption;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Referral code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Please copy the code manually.");
    }
  };

  const handleSelect = (channel: Channel) => {
    openShare(channel.href({ url, caption, message }));
    onOpenChange(false);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: "Join me on Datta", text: caption, url });
      onOpenChange(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("Sharing isn't available on this device.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your invite</DialogTitle>
          <DialogDescription>
            Send your referral code to friends — they add it when they sign up.
          </DialogDescription>
        </DialogHeader>

        {/* Referral code chip */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-brand/30 bg-brand/5 px-4 py-3 text-left transition-colors hover:bg-brand/10"
        >
          <span className="font-mono text-base font-semibold tracking-wider text-foreground">
            {code}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {copied ? (
              <>
                <Check className="size-4 text-brand" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-4" /> Copy
              </>
            )}
          </span>
        </button>

        {/* Channel grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-x-2 gap-y-4 pt-1"
        >
          {CHANNELS.map((channel) => (
            <motion.button
              key={channel.key}
              type="button"
              variants={item}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSelect(channel)}
              className="group flex flex-col items-center gap-2 outline-none"
            >
              <span
                className={`flex size-14 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-black/5 transition-shadow group-hover:shadow-md ${channel.ring} ${channel.iconClass ?? ""}`}
                style={channel.style}
              >
                {channel.icon}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">{channel.label}</span>
            </motion.button>
          ))}

          {canNativeShare && (
            <motion.button
              type="button"
              variants={item}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleNativeShare}
              className="group flex flex-col items-center gap-2 outline-none"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-muted text-foreground shadow-sm ring-1 ring-black/5 transition-shadow group-hover:shadow-md">
                <Share2 className="size-6" />
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">More</span>
            </motion.button>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
