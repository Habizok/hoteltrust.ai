// Eszköz és böngésző detektálás user agent alapján

export function detectDevice(userAgent: string): { device: string; browser: string; os: string } {
  const ua = userAgent.toLowerCase();
  
  // Device detection
  let device = 'Ismeretlen';
  if (/iphone|ipod/.test(ua)) {
    device = 'iPhone';
  } else if (/ipad/.test(ua)) {
    device = 'iPad';
  } else if (/android/.test(ua)) {
    device = 'Android';
  } else if (/windows phone/.test(ua)) {
    device = 'Windows Phone';
  } else if (/macintosh|mac os x/.test(ua)) {
    device = 'Mac';
  } else if (/windows/.test(ua)) {
    device = 'Windows';
  } else if (/linux/.test(ua)) {
    device = 'Linux';
  }
  
  // Browser detection
  let browser = 'Ismeretlen';
  if (/edg/.test(ua)) {
    browser = 'Edge';
  } else if (/chrome/.test(ua) && !/edg/.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/.test(ua) && !/chrome/.test(ua)) {
    browser = 'Safari';
  } else if (/firefox/.test(ua)) {
    browser = 'Firefox';
  } else if (/opera|opr/.test(ua)) {
    browser = 'Opera';
  } else if (/msie|trident/.test(ua)) {
    browser = 'Internet Explorer';
  }
  
  // OS detection
  let os = 'Ismeretlen';
  if (/iphone|ipod/.test(ua)) {
    os = 'iOS';
  } else if (/ipad/.test(ua)) {
    os = 'iPadOS';
  } else if (/android/.test(ua)) {
    os = 'Android';
  } else if (/windows phone/.test(ua)) {
    os = 'Windows Phone';
  } else if (/macintosh|mac os x/.test(ua)) {
    os = 'macOS';
  } else if (/windows/.test(ua)) {
    os = 'Windows';
  } else if (/linux/.test(ua)) {
    os = 'Linux';
  }
  
  return { device, browser, os };
}
