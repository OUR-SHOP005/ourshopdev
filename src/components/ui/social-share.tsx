"use client";

import React, { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  RedditShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookShareCount,
  PinterestShareCount,
  RedditShareCount,
  FacebookIcon,
  LinkedinIcon,
  PinterestIcon,
  RedditIcon,
  TelegramIcon,
  WhatsappIcon,
  EmailIcon,
  XIcon,
} from "react-share";
import { cn } from "@/lib/utils";
import { ShareIcon } from "lucide-react";

export interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  media?: string;
  hashtags?: string[];
  className?: string;
  buttonSize?: number;
  round?: boolean;
  showShareCount?: boolean;
  iconBgStyle?: React.CSSProperties;
  iconFillColor?: string;
  platforms?: (
    | "facebook"
    | "twitter"
    | "linkedin"
    | "pinterest"
    | "reddit"
    | "telegram"
    | "whatsapp"
    | "email"
  )[];
  compact?: boolean;
  variant?: "default" | "outline" | "floating";
}

// SocialShareList component that displays multiple sharing platforms in a row
export interface SocialShareListProps {
  url: string;
  title: string;
  description?: string;
  media?: string;
  hashtags?: string[];
  className?: string;
  buttonSize?: number;
  round?: boolean;
  showShareCount?: boolean;
  iconBgStyle?: React.CSSProperties;
  iconFillColor?: string;
  platforms?: (
    | "facebook"
    | "twitter"
    | "linkedin"
    | "pinterest"
    | "reddit"
    | "telegram"
    | "whatsapp"
    | "email"
  )[];
  spacing?: number;
}

export const SocialShareList = ({
  url,
  title,
  description = "",
  media = "",
  hashtags = [],
  className = "",
  buttonSize = 32,
  round = true,
  showShareCount = false,
  iconBgStyle,
  iconFillColor,
  platforms = ["facebook", "twitter", "linkedin", "whatsapp", "telegram"],
  spacing = 2,
}: SocialShareListProps) => {
  const renderShareButton = (platform: string) => {
    switch (platform) {
      case "facebook":
        return (
          <div className="share-button-container">
            <FacebookShareButton url={url} hashtag={hashtags[0]}>
              <FacebookIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
            </FacebookShareButton>
            {showShareCount && (
              <div className="share-count mt-1 text-xs text-center text-muted-foreground">
                <FacebookShareCount url={url}>
                  {(count) => (count > 0 ? count : "")}
                </FacebookShareCount>
              </div>
            )}
          </div>
        );
      case "twitter":
        return (
          <div className="share-button-container">
            <TwitterShareButton url={url} title={title} hashtags={hashtags}>
              <XIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
            </TwitterShareButton>
          </div>
        );
      case "linkedin":
        return (
          <div className="share-button-container">
            <LinkedinShareButton url={url} title={title}>
              <LinkedinIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
            </LinkedinShareButton>
          </div>
        );
      case "pinterest":
        return (
          <div className="share-button-container">
            <PinterestShareButton url={url} media={media || url}>
              <PinterestIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
            </PinterestShareButton>
            {showShareCount && (
              <div className="share-count mt-1 text-xs text-center text-muted-foreground">
                <PinterestShareCount url={url}>
                  {(count) => (count > 0 ? count : "")}
                </PinterestShareCount>
              </div>
            )}
          </div>
        );
      case "reddit":
        return (
          <div className="share-button-container">
            <RedditShareButton url={url} title={title}>
              <RedditIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
            </RedditShareButton>
            {showShareCount && (
              <div className="share-count mt-1 text-xs text-center text-muted-foreground">
                <RedditShareCount url={url}>
                  {(count) => (count > 0 ? count : "")}
                </RedditShareCount>
              </div>
            )}
          </div>
        );
      case "telegram":
        return (
          <div className="share-button-container">
            <TelegramShareButton url={url} title={title}>
              <TelegramIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
            </TelegramShareButton>
          </div>
        );
      case "whatsapp":
        return (
          <div className="share-button-container">
            <WhatsappShareButton url={url} title={title} separator=" | ">
              <WhatsappIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
            </WhatsappShareButton>
          </div>
        );
      case "email":
        return (
          <div className="share-button-container">
            <EmailShareButton url={url} subject={title} body={description}>
              <EmailIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
            </EmailShareButton>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("social-share-list", className)}>
      <div className={`flex flex-row flex-wrap gap-${spacing}`}>
        {platforms.map((platform) => (
          <div key={platform} className="transform transition-transform hover:scale-110">
            {renderShareButton(platform)}
          </div>
        ))}
      </div>
      <style jsx global>{`
        .social-share-list button {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .social-share-list button:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

const SocialShare = ({
  url,
  title,
  description = "",
  media = "",
  hashtags = [],
  className = "",
  buttonSize = 32,
  round = true,
  showShareCount = true,
  iconBgStyle,
  iconFillColor,
  platforms = [
    "facebook",
    "twitter",
    "linkedin",
    "pinterest",
    "reddit",
    "telegram",
    "whatsapp",
    "email",
  ],
  compact = false,
  variant = "default",
}: SocialShareProps) => {
  const [expanded, setExpanded] = useState(!compact);

  const renderShareButton = (platform: string) => {
    switch (platform) {
      case "facebook":
        return (
          <div className='share-button-container group'>
            <FacebookShareButton
              url={url}
              hashtag={hashtags[0]}
            >
              <FacebookIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
              {variant === "outline" && (
                <span className='button-label'>Facebook</span>
              )}
            </FacebookShareButton>
            {showShareCount && (
              <div className='share-count mt-1 text-xs text-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'>
                <FacebookShareCount url={url}>
                  {(count) => (count > 0 ? count : "")}
                </FacebookShareCount>
              </div>
            )}
          </div>
        );
      case "twitter":
        return (
          <div className='share-button-container group'>
            <TwitterShareButton
              url={url}
              title={title}
              hashtags={hashtags}
            >
              <XIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
              {variant === "outline" && (
                <span className='button-label'>X / Twitter</span>
              )}
            </TwitterShareButton>
          </div>
        );
      case "linkedin":
        return (
          <div className='share-button-container group'>
            <LinkedinShareButton
              url={url}
              title={title}
            >
              <LinkedinIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
              {variant === "outline" && (
                <span className='button-label'>LinkedIn</span>
              )}
            </LinkedinShareButton>
          </div>
        );
      case "pinterest":
        return (
          <div className='share-button-container group'>
            <PinterestShareButton
              url={url}
              media={media || url}
            >
              <PinterestIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
              {variant === "outline" && (
                <span className='button-label'>Pinterest</span>
              )}
            </PinterestShareButton>
            {showShareCount && (
              <div className='share-count mt-1 text-xs text-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'>
                <PinterestShareCount url={url}>
                  {(count) => (count > 0 ? count : "")}
                </PinterestShareCount>
              </div>
            )}
          </div>
        );
      case "reddit":
        return (
          <div className='share-button-container group'>
            <RedditShareButton
              url={url}
              title={title}
            >
              <RedditIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
              {variant === "outline" && (
                <span className='button-label'>Reddit</span>
              )}
            </RedditShareButton>
            {showShareCount && (
              <div className='share-count mt-1 text-xs text-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'>
                <RedditShareCount url={url}>
                  {(count) => (count > 0 ? count : "")}
                </RedditShareCount>
              </div>
            )}
          </div>
        );
      case "telegram":
        return (
          <div className='share-button-container group'>
            <TelegramShareButton
              url={url}
              title={title}
            >
              <TelegramIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
              {variant === "outline" && (
                <span className='button-label'>Telegram</span>
              )}
            </TelegramShareButton>
          </div>
        );
      case "whatsapp":
        return (
          <div className='share-button-container group'>
            <WhatsappShareButton
              url={url}
              title={title}
              separator=' | '
            >
              <WhatsappIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
              {variant === "outline" && (
                <span className='button-label'>WhatsApp</span>
              )}
            </WhatsappShareButton>
          </div>
        );
      case "email":
        return (
          <div className='share-button-container group'>
            <EmailShareButton
              url={url}
              subject={title}
              body={description}
            >
              <EmailIcon
                size={buttonSize}
                round={round}
                bgStyle={iconBgStyle}
                iconFillColor={iconFillColor}
              />
              {variant === "outline" && (
                <span className='button-label'>Email</span>
              )}
            </EmailShareButton>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("social-share-container", className)}>
      {compact && (
        <button
          onClick={() => setExpanded(!expanded)}
          className='compact-toggle flex items-center justify-center p-2 mb-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
          aria-label={expanded ? "Hide share options" : "Show share options"}
        >
          <ShareIcon size={18} />
        </button>
      )}
      <div
        className={cn(
          "social-share-buttons",
          variant === "default" && "flex flex-wrap gap-2",
          variant === "outline" && "flex flex-col sm:flex-row gap-2",
          variant === "floating" &&
            "fixed right-4 bottom-20 flex flex-col gap-2 z-50",
          compact && !expanded && "hidden",
          compact && expanded && "animate-fade-in-up"
        )}
      >
        {platforms.map((platform) => (
          <div
            key={platform}
            className={cn(
              variant === "outline" &&
                "flex items-center bg-muted hover:bg-muted/80 rounded-md p-2 transition-colors",
              variant === "floating" &&
                "transform transition-transform hover:scale-110"
            )}
          >
            {renderShareButton(platform)}
          </div>
        ))}
      </div>
      <style
        jsx
        global
      >{`
        .social-share-container button {
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .social-share-container button:hover {
          transform: ${variant !== "outline" ? "scale(1.1)" : "none"};
        }

        .button-label {
          margin-left: 8px;
          font-size: 14px;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SocialShare;
