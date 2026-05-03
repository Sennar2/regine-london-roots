import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl, type WhatsAppInput } from "@/lib/whatsapp";

type Props = WhatsAppInput & {
  label?: string | null;
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "olive" | "outline" | "ghost";
};

export function WhatsAppCTA({ number, url, message, label, className, size = "default", variant = "olive" }: Props) {
  const href = buildWhatsAppUrl({ number, url, message });
  if (!href) return null;
  const text = label?.trim() || "Order via WhatsApp";

  const styles =
    variant === "olive"
      ? "bg-brand-olive text-brand-cream hover:bg-brand-olive/90 border border-brand-olive"
      : variant === "outline"
      ? "bg-transparent text-brand-olive border border-brand-olive/40 hover:bg-brand-olive/10"
      : "bg-transparent text-brand-olive hover:bg-brand-olive/10";

  return (
    <Button asChild size={size} className={cn(styles, "shadow-sm", className)}>
      <a href={href} target="_blank" rel="noreferrer noopener">
        <MessageCircle className="mr-1 h-4 w-4" />
        {text}
      </a>
    </Button>
  );
}
