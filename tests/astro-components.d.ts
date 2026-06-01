declare module "*.astro" {
  // Astro's experimental Container API accepts compiled `.astro` modules.
  // The concrete component type is framework-internal, so tests use `any` here.
  // biome-ignore lint/suspicious/noExplicitAny: Astro component module typing is internal.
  const component: any;
  export default component;
}
