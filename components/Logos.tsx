import Image from 'next/image';

export const GoogleLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <div className={`h-16 relative flex items-center justify-center ${className.includes('w-') ? '' : 'w-auto'}`}>
    <Image
      src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
      alt="Google"
      width={140}
      height={48}
      className="h-12 w-auto object-contain"
      unoptimized
    />
  </div>
);

export const TripAdvisorLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <div className={`h-16 relative flex items-center justify-center ${className.includes('w-') ? '' : 'w-auto'}`}>
    <Image
      src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
      alt="TripAdvisor"
      width={180}
      height={48}
      className="h-12 w-auto object-contain"
      unoptimized
    />
  </div>
);

export const BookingLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <div className={`h-16 relative flex items-center justify-center ${className.includes('w-') ? '' : 'w-auto'}`}>
    <Image
      src="/logos/booking.webp"
      alt="Booking.com"
      width={180}
      height={48}
      className="h-12 w-auto object-contain"
      unoptimized
    />
  </div>
);

export const ChatGPTLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <div className={`h-16 relative flex items-center justify-center ${className.includes('w-') ? '' : 'w-auto'}`}>
    <Image
      src="/logos/chatgpt.png"
      alt="ChatGPT"
      width={160}
      height={48}
      className="h-12 w-auto object-contain"
      unoptimized
    />
  </div>
);

export const PerplexityLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <div className={`h-16 relative flex items-center justify-center ${className.includes('w-') ? '' : 'w-auto'}`}>
    <Image
      src="/logos/perplexity.svg"
      alt="Perplexity"
      width={160}
      height={48}
      className="h-12 w-auto object-contain"
      unoptimized
    />
  </div>
);

export const BingLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <div className={`h-16 relative flex items-center justify-center ${className.includes('w-') ? '' : 'w-auto'}`}>
    <Image
      src="/logos/bing.svg"
      alt="Bing"
      width={100}
      height={48}
      className="h-12 w-auto object-contain"
      unoptimized
    />
  </div>
);
