import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageApp from "../../service-page-app";
import { findIndexableRoute, seoServices, serviceRoutePath } from "../../site-registry";

export function generateStaticParams() {
  return seoServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = findIndexableRoute(serviceRoutePath(slug));
  if (!route || route.kind !== "service") return {};
  return {
    title: { absolute: route.metadata.title },
    description: route.metadata.description,
    alternates: { canonical: route.path },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!seoServices.some((service) => service.slug === slug)) notFound();
  return <ServicePageApp slug={slug} />;
}
