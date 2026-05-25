import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LearnCta } from '@/components/LearnCta';
import { LEARN_LINKS } from '@/lib/learnLinks';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
        <LearnCta
          className="mt-8"
          compact
          description="Explore resume, ATS, and interview tips while you are here."
          actionText="Career Guides"
          href={LEARN_LINKS.articles}
        />
      </div>
    </div>
  );
};

export default NotFound;
