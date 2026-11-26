"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@govtechmy/myds-react/hooks";
import { ToastProvider, ToastViewport } from "@govtechmy/myds-react/toast";
import { Skiplink } from "@govtechmy/myds-react/skiplink";
import {
  AnnounceBar,
  AnnounceBarDescription,
  AnnounceBarTag,
} from "@govtechmy/myds-react/announce-bar";
import {
  Navbar,
  NavbarAction,
  NavbarLogo,
  NavbarMenu,
  NavbarMenuItem,
} from "@govtechmy/myds-react/navbar";
import {
  Footer,
  FooterLogo,
  FooterSection,
  SiteInfo,
  SiteLink,
  SiteLinkGroup,
} from "@govtechmy/myds-react/footer";
import { ThemeSwitch } from "@govtechmy/myds-react/theme-switch";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import { HakkuProvider, useHakku } from "@/lib/store/HakkuContext";
import { t } from "@/lib/i18n/dictionary";
import { MyDigitalIdModal } from "@/components/shell/MyDigitalIdModal";
import { callIlmuStatus } from "@/lib/ilmu/browserBridge";
import { Cpu, Globe, ShieldCheck } from "lucide-react";

function InnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    locale,
    setLocale,
    ilmuMode,
    setIlmuMode,
    digitalIdProfile,
    setMyDigitalIdDialogOpen,
  } = useHakku();
  const [liveAvailable, setLiveAvailable] = useState(false);

  useEffect(() => {
    callIlmuStatus()
      .then((d) => setLiveAvailable(Boolean(d.credentialsConfigured)))
      .catch(() => setLiveAvailable(false));
  }, []);

  const isMirrorRoute = pathname?.startsWith("/portals/");

  return (
    <div className="flex min-h-screen flex-col bg-bg-white text-txt-black-900">
      <Skiplink href="#main-content">
        {locale === "bm" ? "Langkau ke kandungan utama" : "Skip to main content"}
      </Skiplink>

      {!isMirrorRoute && (
        <AnnounceBar border className="no-print bg-bg-washed">
          <AnnounceBarTag variant="primary" size="small">
            ILMUcode 2026
          </AnnounceBarTag>
          <AnnounceBarDescription>
            <span className="text-body-xs text-txt-black-700">
              {t(locale, "announceBanner")}
            </span>
          </AnnounceBarDescription>
        </AnnounceBar>
      )}

      <Navbar className="no-print">
        <NavbarLogo src="/hakku-logo.svg" alt="Hakku Logo" href="/">
          Hakku
        </NavbarLogo>

        <NavbarMenu>
          <NavbarMenuItem href="/" asChild>
            <Link href="/">{t(locale, "navHome")}</Link>
          </NavbarMenuItem>
          <NavbarMenuItem href="/workspace" asChild>
            <Link href="/workspace">{t(locale, "navWorkspace")}</Link>
          </NavbarMenuItem>
          <NavbarMenuItem href="/portals" asChild>
            <Link href="/portals">{t(locale, "navPortals")}</Link>
          </NavbarMenuItem>
          <NavbarMenuItem href="/vision" asChild>
            <Link href="/vision">{t(locale, "navVision")}</Link>
          </NavbarMenuItem>
        </NavbarMenu>

        <NavbarAction>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Toggleable Sovereign AI Mode */}
            <button
              type="button"
              onClick={() => setIlmuMode(ilmuMode === "demo" ? "live" : "demo")}
              title={
                liveAvailable
                  ? "Toggle between Live YTL ILMU API and Offline Sovereign Demo"
                  : "Sovereign Demo active (add ILMU_API_KEY in .env.local for Live YTL ILMU)"
              }
              className="hidden items-center gap-1.5 rounded-full border border-otl-gray-200 bg-bg-washed px-2.5 py-1 text-body-xs font-medium text-txt-black-700 transition hover:bg-bg-white-hover md:flex"
            >
              <Cpu className="h-3.5 w-3.5 text-txt-primary" />
              <span>
                ILMU:{" "}
                {ilmuMode === "live"
                  ? liveAvailable
                    ? "Live API"
                    : "Live (Fallback)"
                  : "Demo"}
              </span>
            </button>

            {/* EN / BM Language Switch */}
            <Button
              variant="default-outline"
              size="small"
              onClick={() => setLocale(locale === "en" ? "bm" : "en")}
              aria-label="Toggle language"
            >
              <Globe className="mr-1 h-3.5 w-3.5" />
              {locale === "en" ? "BM" : "EN"}
            </Button>

            <ThemeSwitch />

            <Button
              variant={digitalIdProfile.authenticated ? "primary-outline" : "primary-fill"}
              size="small"
              onClick={() => setMyDigitalIdDialogOpen(true)}
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {digitalIdProfile.authenticated
                  ? digitalIdProfile.nama.split(" ")[0]
                  : t(locale, "signInMyDigitalId")}
              </span>
              <span className="sm:hidden">MyDigital ID</span>
            </Button>
          </div>
        </NavbarAction>
      </Navbar>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer className="no-print">
        <FooterSection>
          <SiteInfo>
            <FooterLogo
              logoTitle="Hakku"
              logo={
                <img
                  src="/hakku-logo.svg"
                  alt="Hakku"
                  className="h-7 w-7 rounded-md"
                />
              }
            />
            <p className="text-body-xs text-txt-black-500">
              {t(locale, "tagline")}
            </p>
            <div className="pt-1">
              <Tag size="small" variant="success" dot>
                {t(locale, "sovereignBadge")}
              </Tag>
            </div>
          </SiteInfo>

          <SiteLinkGroup groupTitle={locale === "bm" ? "Platform" : "Platform"}>
            <SiteLink asChild href="/">
              <Link href="/">{t(locale, "navHome")}</Link>
            </SiteLink>
            <SiteLink asChild href="/workspace">
              <Link href="/workspace">{t(locale, "navWorkspace")}</Link>
            </SiteLink>
            <SiteLink asChild href="/vision">
              <Link href="/vision">{t(locale, "navVision")}</Link>
            </SiteLink>
          </SiteLinkGroup>

          <SiteLinkGroup
            groupTitle={
              locale === "bm" ? "Simulasi Portal" : "Official Portal Mirrors"
            }
          >
            <SiteLink asChild href="/portals/perkeso">
              <Link href="/portals/perkeso">PERKESO ASSIST & Lindung</Link>
            </SiteLink>
            <SiteLink asChild href="/portals/kwsp">
              <Link href="/portals/kwsp">KWSP i-Akaun & i-Saraan</Link>
            </SiteLink>
            <SiteLink asChild href="/portals/kesuma">
              <Link href="/portals/kesuma">JTKSM WFW & Tribunal Gig</Link>
            </SiteLink>
            <SiteLink asChild href="/portals/mytax">
              <Link href="/portals/mytax">MyTax e-Duti Setem & SSM</Link>
            </SiteLink>
          </SiteLinkGroup>

          <SiteLinkGroup
            groupTitle={
              locale === "bm" ? "Sistem Reka Bentuk" : "Standards & Design"
            }
          >
            <SiteLink
              href="https://design.digital.gov.my/en"
              newTab
            >
              MYDS (design.digital.gov.my)
            </SiteLink>
            <SiteLink href="https://www.digital-id.my/" newTab>
              MyDigital ID Roadmap
            </SiteLink>
          </SiteLinkGroup>
        </FooterSection>

        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 text-body-xs text-txt-black-500 md:flex-row md:items-center md:justify-between">
          <p>{t(locale, "disclaimer")}</p>
          <p className="shrink-0">
            © 2026 Hakku · Built with MYDS (@govtechmy/myds-react)
          </p>
        </div>
      </Footer>

      <MyDigitalIdModal />
      <ToastViewport />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="hakku-myds-theme">
      <ToastProvider>
        <HakkuProvider>
          <InnerShell>{children}</InnerShell>
        </HakkuProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
