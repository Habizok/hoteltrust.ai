/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Die alte Seite war mehrsprachig (/de, /hu). Alte Adressen führen auf die neue Startseite.
    return [
      { source: '/de', destination: '/', permanent: true },
      { source: '/hu', destination: '/', permanent: true },
      { source: '/de/impressum', destination: '/impressum', permanent: true },
      { source: '/hu/impressum', destination: '/impressum', permanent: true },
      { source: '/de/datenschutz', destination: '/datenschutz', permanent: true },
      { source: '/hu/datenschutz', destination: '/datenschutz', permanent: true },
      { source: '/de/:path*', destination: '/', permanent: true },
      { source: '/hu/:path*', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
