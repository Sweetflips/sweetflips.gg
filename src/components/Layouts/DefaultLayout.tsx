"use client";
import React, { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer/Footer";
import CookieConsent from "@/components/CookieConsent/CookieConsent";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-auto p-4 md:p-6 2xl:p-10">
          {children}
        </div>
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}
