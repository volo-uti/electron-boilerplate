import { useTranslations } from "use-intl";

export function HomePage() {
  const t = useTranslations("Home");
  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
      <p className="max-w-prose text-muted-foreground">{t("description")}</p>
    </section>
  );
}
