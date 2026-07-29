import React from 'react';
import {
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Linkedin,
  Twitter,
  Send,
  Globe,
  Share2
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

/**
 * Reusable SocialLinks component that dynamically renders active social links from backend settings.
 */
const SocialLinks = ({
  variant = 'default', // 'default', 'footer', 'compact'
  iconSize = 20,
  className = ''
}) => {
  const { settings } = useSettings();

  if (!settings) return null;

  const openNewTab = settings.openSocialNewTab !== false;
  const linkTargetProps = openNewTab
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  // Formulate cleaned WhatsApp link with default pre-filled message
  const whatsappNum = (settings.whatsappSocial || settings.whatsapp || settings.phone || '').replace(/[^0-9]/g, '');
  const defaultMsg = settings.whatsappDefaultMessage || 'Hello! I would like to inquire about booking a makeup appointment.';
  const whatsappUrl = whatsappNum ? `https://wa.me/${whatsappNum}?text=${encodeURIComponent(defaultMsg)}` : '';

  const socialPlatforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      url: settings.instagram,
      enabled: settings.instagramEnabled !== false && Boolean(settings.instagram),
      icon: Instagram,
      hoverClass: 'hover:bg-pink-600 hover:text-white hover:border-pink-600',
      compactHoverClass: 'hover:bg-primary hover:text-white'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: whatsappUrl,
      enabled: settings.whatsappSocialEnabled !== false && Boolean(whatsappUrl),
      icon: MessageCircle,
      hoverClass: 'hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
      compactHoverClass: 'hover:bg-emerald-600 hover:text-white'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: settings.facebook,
      enabled: settings.facebookEnabled !== false && Boolean(settings.facebook),
      icon: Facebook,
      hoverClass: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
      compactHoverClass: 'hover:bg-blue-600 hover:text-white'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: settings.youtube,
      enabled: settings.youtubeEnabled !== false && Boolean(settings.youtube),
      icon: Youtube,
      hoverClass: 'hover:bg-red-600 hover:text-white hover:border-red-600',
      compactHoverClass: 'hover:bg-red-600 hover:text-white'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      url: settings.pinterest,
      enabled: settings.pinterestEnabled && Boolean(settings.pinterest),
      icon: Share2,
      hoverClass: 'hover:bg-rose-700 hover:text-white hover:border-rose-700',
      compactHoverClass: 'hover:bg-rose-700 hover:text-white'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: settings.linkedin,
      enabled: settings.linkedinEnabled && Boolean(settings.linkedin),
      icon: Linkedin,
      hoverClass: 'hover:bg-sky-600 hover:text-white hover:border-sky-600',
      compactHoverClass: 'hover:bg-sky-600 hover:text-white'
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      url: settings.twitter,
      enabled: settings.twitterEnabled && Boolean(settings.twitter),
      icon: Twitter,
      hoverClass: 'hover:bg-slate-800 hover:text-white hover:border-slate-800',
      compactHoverClass: 'hover:bg-slate-800 hover:text-white'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      url: settings.telegram,
      enabled: settings.telegramEnabled && Boolean(settings.telegram),
      icon: Send,
      hoverClass: 'hover:bg-sky-500 hover:text-white hover:border-sky-500',
      compactHoverClass: 'hover:bg-sky-500 hover:text-white'
    },
    {
      id: 'threads',
      name: 'Threads',
      url: settings.threads,
      enabled: settings.threadsEnabled && Boolean(settings.threads),
      icon: Globe,
      hoverClass: 'hover:bg-zinc-800 hover:text-white hover:border-zinc-800',
      compactHoverClass: 'hover:bg-zinc-800 hover:text-white'
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      url: settings.snapchat,
      enabled: settings.snapchatEnabled && Boolean(settings.snapchat),
      icon: Share2,
      hoverClass: 'hover:bg-amber-400 hover:text-black hover:border-amber-400',
      compactHoverClass: 'hover:bg-amber-400 hover:text-black'
    }
  ];

  const activePlatforms = socialPlatforms.filter((p) => p.enabled);

  if (activePlatforms.length === 0) return null;

  if (variant === 'footer') {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {activePlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <a
              key={platform.id}
              href={platform.url}
              {...linkTargetProps}
              className={`rounded-full bg-white/5 border border-white/10 p-2.5 text-slate-300 transition-all cursor-pointer ${platform.hoverClass}`}
              aria-label={platform.name}
              title={platform.name}
            >
              <Icon size={iconSize} />
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {activePlatforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <a
            key={platform.id}
            href={platform.url}
            {...linkTargetProps}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-light text-primary transition-all duration-300 hover:scale-110 shadow-xs cursor-pointer ${platform.compactHoverClass}`}
            aria-label={platform.name}
            title={platform.name}
          >
            <Icon size={iconSize} />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
