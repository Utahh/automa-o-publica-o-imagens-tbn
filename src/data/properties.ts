import type { Property } from "../types";

export function getPropertyBySlug(properties: Property[], slug: string) {
  return properties.find((p) => p.slug === slug);
}

export function getFeaturedProperties(properties: Property[]) {
  return properties.filter((p) => p.featured);
}

export function getRelatedProperties(properties: Property[], current: Property, limit = 3) {
  return properties
    .filter((p) => p.id !== current.id)
    .sort((a, b) => Math.abs(a.price - current.price) - Math.abs(b.price - current.price))
    .slice(0, limit);
}
