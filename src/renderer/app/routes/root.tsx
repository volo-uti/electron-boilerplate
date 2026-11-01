import { createRootRoute, Link, Outlet, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslations } from "use-intl";
import { useLocaleStore } from "@renderer/shared/i18n/locale-store";
import { Button } from "@renderer/ui/atoms/button";
import { SiteHeader } from "@renderer/ui/organisms/site-header";
import { AppShell } from "@renderer/ui/templates/app-shell";

function RootLayout() {
  const t = useTranslations("Shell");
  const { locale, setLocale } = useLocaleStore();

  useEffect(() => {
    document.title = t("title");
  }, [t]);

  return (
    <AppShell
      header={
        <SiteHeader
          title={t("title")}
          themeLabel={t("toggleTheme")}
          localeLabel={t("language")}
          locale={locale}
          onLocaleChange={setLocale}
        />
      }
    >
      <Outlet />
    </AppShell>
  );
}

function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Link to="/" className="underline">
        {t("home")}
      </Link>
    </section>
  );
}

function ErrorPage({ reset }: ErrorComponentProps) {
  const t = useTranslations("Error");
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </section>
  );
}

/** Root route: the window frame (header and shell) around every page, plus the not-found and error pages. */
export const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: ErrorPage,
});
