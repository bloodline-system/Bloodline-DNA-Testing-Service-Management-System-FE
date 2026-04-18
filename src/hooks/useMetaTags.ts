import { useEffect } from "react";
import { updateMetaTags, resetMetaTags } from "@/lib/meta-tags";

interface UseMetaTagsConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * Hook to update meta tags dynamically for social media sharing
 */
export const useMetaTags = (config?: UseMetaTagsConfig) => {
  useEffect(() => {
    if (config) {
      updateMetaTags(config);
    }
    return () => {
      resetMetaTags();
    };
  }, [config]);
};
