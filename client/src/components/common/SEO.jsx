import { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

/**
 * Dynamic SEO Component
 * Automatically injects page title, meta descriptions, keywords, canonical URLs,
 * OpenGraph, Twitter Cards, Robots, Author, Favicon, and LocalBusiness JSON-LD schema.
 */
const SEO = ({ title, description, ogTitle, ogDescription, ogImage, ogUrl }) => {
  const { settings } = useSettings();

  useEffect(() => {
    const siteName = settings?.websiteName || 'Ankita Makeup';
    const fallbackTitle = settings?.metaTitle || `${siteName} | Professional Makeup Artist`;
    const finalTitle = title ? `${title} | ${siteName}` : fallbackTitle;
    document.title = finalTitle;

    // Helper to get or create meta elements
    const setMetaTag = (attributeName, attributeValue, contentValue) => {
      if (!contentValue) return;
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper to get or create link elements
    const setLinkTag = (relValue, hrefValue) => {
      if (!hrefValue) return;
      let element = document.querySelector(`link[rel="${relValue}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relValue);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefValue);
    };

    // 1. Meta Description, Keywords, Author, Robots
    const fallbackDesc = settings?.metaDescription || settings?.shortDescription || 'Certified luxury makeup artist and hairstylist based in New Delhi.';
    const finalDesc = description || fallbackDesc;
    setMetaTag('name', 'description', finalDesc);

    if (settings?.metaKeywords) {
      setMetaTag('name', 'keywords', settings.metaKeywords);
    }
    if (settings?.author) {
      setMetaTag('name', 'author', settings.author);
    }
    if (settings?.robotsMeta) {
      setMetaTag('name', 'robots', settings.robotsMeta);
    }
    if (settings?.googleSearchConsoleVerification) {
      // Handles both full tag (<meta name="google-site-verification" content="XYZ" />) and raw token (XYZ)
      let gscToken = settings.googleSearchConsoleVerification.trim();
      const contentMatch = gscToken.match(/content=["']([^"']+)["']/i);
      if (contentMatch) {
        gscToken = contentMatch[1];
      }
      setMetaTag('name', 'google-site-verification', gscToken);
    }

    // 2. Canonical URL
    const canonical = settings?.canonicalUrl || window.location.href;
    setLinkTag('canonical', canonical);

    // 3. Dynamic Favicon
    if (settings?.favicon) {
      setLinkTag('icon', settings.favicon);
    }

    // 4. OpenGraph (OG) Meta Tags
    const fallbackOgImage = settings?.ogImage || settings?.heroBannerImage || settings?.logo || '';
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'og:title', ogTitle || title || siteName);
    setMetaTag('property', 'og:description', ogDescription || finalDesc);
    setMetaTag('property', 'og:image', ogImage || fallbackOgImage);
    setMetaTag('property', 'og:url', ogUrl || window.location.href);
    setMetaTag('property', 'og:type', 'website');

    // 5. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', ogTitle || title || siteName);
    setMetaTag('name', 'twitter:description', ogDescription || finalDesc);
    setMetaTag('name', 'twitter:image', ogImage || fallbackOgImage);

    // 6. LocalBusiness Structured JSON-LD Schema
    let jsonLdScript = document.getElementById('json-ld-localbusiness');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'json-ld-localbusiness';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      'name': settings?.businessName || siteName,
      'description': finalDesc,
      'url': settings?.canonicalUrl || window.location.origin,
      'telephone': settings?.phone || '',
      'email': settings?.email || '',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': settings?.address || 'New Delhi, India',
        'addressLocality': settings?.city || 'New Delhi',
        'addressRegion': settings?.state || 'Delhi',
        'postalCode': settings?.pincode || '110001',
        'addressCountry': settings?.country || 'India'
      },
      'openingHours': settings?.businessTiming || 'Mo-Sa 09:00-20:00'
    };

    if (settings?.logo) {
      schemaData.logo = settings.logo;
      schemaData.image = settings.logo;
    }

    // 7. Dynamic Google Analytics (gtag.js) Injection
    const gaId = settings?.googleAnalyticsId?.trim();
    if (gaId) {
      // Inject external gtag script
      let gtagScript = document.getElementById('ga-gtag-script');
      if (!gtagScript) {
        gtagScript = document.createElement('script');
        gtagScript.id = 'ga-gtag-script';
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(gtagScript);
      } else {
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      }

      // Inject inline gtag configuration script
      let gtagConfigScript = document.getElementById('ga-gtag-config');
      if (!gtagConfigScript) {
        gtagConfigScript = document.createElement('script');
        gtagConfigScript.id = 'ga-gtag-config';
        document.head.appendChild(gtagConfigScript);
      }
      gtagConfigScript.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
    }

  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl, settings]);

  return null;
};

export default SEO;
