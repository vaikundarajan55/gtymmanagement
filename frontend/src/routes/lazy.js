// Route-level code splitting: the page's chunk is fetched by the router only when the route matches.
// Usage: { path: 'about', ...page(() => import('../pages/website/About')) }
export const page = (importer) => ({
  lazy: async () => ({ Component: (await importer()).default }),
});
