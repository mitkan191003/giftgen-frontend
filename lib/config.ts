export const appConfig = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
  demoMode: !process.env.NEXT_PUBLIC_BACKEND_URL
};
