import { useEffect } from 'react';
import axe from 'axe-core';
import { devLog, devError, devGroup, devGroupEnd } from '@/lib/utils/devUtils';

const useAccessibilityAudit = () => {
  useEffect(() => {
    // Only run accessibility audit in development mode
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      const runAudit = async () => {
        try {
          const results = await axe.run(document, {
            rules: {
              'color-contrast': { enabled: true },
              'heading-order': { enabled: true },
              'label': { enabled: true },
              'button-name': { enabled: true },
              'link-name': { enabled: true },
              'image-alt': { enabled: true },
              'aria-roles': { enabled: true },
              'aria-valid-attr-value': { enabled: true },
              'aria-required-attr': { enabled: true },
              'aria-required-children': { enabled: true },
              'aria-required-parent': { enabled: true },
              'aria-allowed-attr': { enabled: true },
              'aria-hidden-body': { enabled: true },
              'aria-hidden-focus': { enabled: true },
              'duplicate-id': { enabled: true },
              'empty-heading': { enabled: true },
              'landmark-one-main': { enabled: true },
              'landmark-unique': { enabled: true },
              'page-has-heading-one': { enabled: true },
              'region': { enabled: true }
            }
          });
          
          if (results.violations.length > 0) {
            devGroup('Accessibility Violations Found:');
            results.violations.forEach(violation => {
              devGroup(`%c${violation.help}`, 'color: red; font-weight: bold;');
              devLog(`Description: ${violation.description}`);
              devLog(`Impact: ${violation.impact}`);
              devLog(`Help URL: ${violation.helpUrl}`);
              devGroup('Elements:');
              violation.nodes.forEach(node => {
                devLog(`- ${node.html}`);
                devLog(`  Target: ${node.target.join(', ')}`);
              });
              devGroupEnd();
            });
            devGroupEnd();
          } else {
            devLog('%cNo accessibility violations found!', 'color: green; font-weight: bold;');
          }
        } catch (error) {
          devError('Accessibility audit failed:', error);
        }
      };

      // Run audit after component mount
      setTimeout(runAudit, 1000);
    }
  }, []);
};

export default useAccessibilityAudit;