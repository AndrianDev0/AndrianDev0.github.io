export const featuredProjectEvent = "andrian:featured-project";

export type FeaturedProjectId = "nebo" | "drop" | "tehnotek" | "simka";

export function selectFeaturedProject(projectId: FeaturedProjectId) {
  window.dispatchEvent(new CustomEvent<FeaturedProjectId>(featuredProjectEvent, { detail: projectId }));
}
