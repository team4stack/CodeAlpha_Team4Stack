import { useEffect } from 'react';
import { RECAPTCHA_SITE_KEY } from '@/lib/utils/constants';

interface GrecaptchaApi {
  render?: (
    container: string | HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    }
  ) => unknown;
  ready?: (callback: () => void) => void;
  reset?: () => void;
  getResponse?: () => string;
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaApi;
  }
}

interface UseAuthModalRecaptchaArgs {
  isOpen: boolean;
  isSignUp: boolean;
  isForgotPassword: boolean;
  isVerifying: boolean;
  isResettingPassword: boolean;
  setRecaptchaToken: (token: string | null) => void;
}

export const useAuthModalRecaptcha = ({
  isOpen,
  isSignUp,
  isForgotPassword,
  isVerifying,
  isResettingPassword,
  setRecaptchaToken
}: UseAuthModalRecaptchaArgs) => {
  useEffect(() => {
    if (!isOpen || isSignUp || isForgotPassword || isVerifying || isResettingPassword) {
      return;
    }

    let observer: MutationObserver | null = null;

    const loadRecaptcha = () => {
      const grecaptcha = window.grecaptcha;
      if (grecaptcha?.render) {
        grecaptcha.ready?.(() => {
          const container = document.getElementById('auth-recaptcha-container');
          if (!container || container.children.length > 0) return;

          try {
            if (container.hasAttribute('aria-hidden')) {
              container.removeAttribute('aria-hidden');
            }

            grecaptcha.render?.('auth-recaptcha-container', {
              sitekey: RECAPTCHA_SITE_KEY,
              callback: (token: string) => setRecaptchaToken(token),
              'expired-callback': () => setRecaptchaToken(null),
              'error-callback': () => setRecaptchaToken(null)
            });

            observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                  if (node.nodeType !== Node.ELEMENT_NODE) return;
                  const element = node as Element;

                  const removeInvalidAriaHidden = (target: Element) => {
                    if (target.getAttribute('aria-hidden') === 'true') {
                      const focused = document.activeElement;
                      if (focused && (target.contains(focused) || target === focused)) {
                        target.removeAttribute('aria-hidden');
                      }
                    }
                    target.querySelectorAll('[aria-hidden="true"]').forEach((child) => {
                      const focused = document.activeElement;
                      if (focused && (child.contains(focused) || child === focused)) {
                        child.removeAttribute('aria-hidden');
                      }
                    });
                  };

                  removeInvalidAriaHidden(element);
                  element.querySelectorAll('[aria-hidden="true"]').forEach(removeInvalidAriaHidden);
                });
              });
            });

            observer.observe(container, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['aria-hidden']
            });
          } catch {
            // ignore reCAPTCHA render edge-case failures
          }
        });
      } else {
        setTimeout(loadRecaptcha, 500);
      }
    };

    if (document.querySelector('script[src*="recaptcha"]')) {
      loadRecaptcha();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      script.onload = loadRecaptcha;
      document.body.appendChild(script);
    }

    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      try {
        window.grecaptcha?.reset?.();
      } catch {
        // ignore reset failures
      }

      const container = document.getElementById('auth-recaptcha-container');
      container?.querySelectorAll('[aria-hidden="true"]').forEach((element) => {
        element.removeAttribute('aria-hidden');
      });
    };
  }, [isOpen, isSignUp, isForgotPassword, isVerifying, isResettingPassword, setRecaptchaToken]);
};

