/**
 * This file defines brand assets for the EVOLVE application.
 * The referenced image files should be placed in the /assets/brand/ directory.
 */

/**
 * Path to the primary logo (transparent background, for dark themes).
 */
export const LOGO_PRIMARY = "/assets/brand/evolve-logo-transparent.png";

/**
 * Path to the light-theme logo (with shadow, for light themes).
 */
export const LOGO_LIGHT   = "/assets/brand/evolve-logo-light-shadow.png";

/**
 * Default alt text for brand logos.
 */
export const LOGO_ALT_TEXT = "EVOLVE — AI-Native Ecosystem for Leaders";

/**
 * Returns the appropriate brand logo based on the current theme.
 * @param theme The current theme, 'light' or 'dark'.
 * @returns The path to the logo image.
 */
export const getBrandLogo = (theme: 'light' | 'dark'): string => {
    return theme === 'dark' ? LOGO_PRIMARY : LOGO_LIGHT;
};
