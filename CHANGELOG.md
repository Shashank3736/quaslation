# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-11-01

### Breaking Changes
- **Next.js 16 Upgrade**: Migrated from Next.js 15 to Next.js 16 with breaking API changes
- **React 19 Upgrade**: Updated to React 19.2.0 and React DOM 19.2.0 with new features and breaking changes
- **Domain Migration**: Changed primary domain from quaslation.xyz to quaslation.com
- **Design System Overhaul**: Complete UI redesign with neobrutalism design pattern

### Added
- **Neobrutalism Design System**: Bold, brutalist-inspired UI with thick borders, shadows, and vibrant colors
- **Enhanced Performance Utilities**: New performance optimization library for improved loading times
- **Decorative UI Components**: Added visual design elements for enhanced user experience
- **Optimized Image Loading**: Improved image compression and loading settings in Next.js config

### Changed
- **Framework Upgrades**:
  - Next.js: 15.4.3 → 16.0.1
  - React: 19.1.0 → 19.2.0
  - React DOM: 19.1.0 → 19.2.0
  - @types/react: Updated to 19.2.2
  - @types/react-dom: Updated to 19.2.2
- **Global Styles**: Refactored color schemes and styling across all components
- **Contact Page**: Updated form styling and email contact information
- **Responsive Design**: Refined responsive behavior and button styling across pages
- **Next.js Configuration**: Optimized for improved performance and build times
- **Package Dependencies**: Cleaned up and optimized dependency tree

### Removed
- Hardcoded gradient classes in favor of more flexible styling system
- Legacy styling patterns from previous design system

### Fixed
- HTTP utility improvements in translation scripts
- Sitemap generation for chapters and novels
- Responsive layout issues across various screen sizes

### Technical Debt
- Removed deprecated Next.js 15 patterns
- Updated to React 19 concurrent features
- Modernized component patterns for better performance

## [2.16.0] - 2025-XX-XX

### Added
- **Native comment system**: Full-featured commenting with API routes, admin moderation (hide/show), edit tracking, and Clerk user integration
  - REST API at [route.ts](src/app/api/comments/route.ts) with role-based filtering
  - React components for comment display, forms, and moderation
  - Database schema with indexed queries for performance
- **Enhanced dependencies**: Added rate limiting infrastructure (`@upstash/ratelimit`, `@vercel/kv`), AI SDK (`ai@^5.0.72`), and content processing tools (`turndown`, `html-react-parser`, `date-fns`)

## [2.15.0] - 2025-09-14

### Removed
- Disqus integration and entire comment section functionality.

## [2.14.0] - 2025-08-09

### Added
- Enhanced UI with gradient and glass effects across components
- Custom Disqus component with theme synchronization and error handling
- AI translation functionality with progress tracking and CLI options
- Chapter upload functionality with gray-matter integration for markdown processing
- Translation CLI for Kakuyomu novel data
- Experimental staleTimes for client-side router cache reuse
- RSS routes optimized for static generation with ISR and tag-based invalidation
- Database migration from Supabase to Neon PostgreSQL
- Next.js 15 upgrade with enhanced features

### Changed
- Updated to Next.js 15.4.3 with enhanced features
- Migrated database from Supabase to Neon PostgreSQL
- Refactored chapter handling to use structured ChapterConfig
- Enhanced layout and navbar components for improved theme handling
- Updated dependencies including @next/third-parties, @clerk/nextjs, and drizzle-kit
- Replaced disqus-react with custom Disqus component
- Upgraded to TypeScript 5 with enhanced type safety

### Fixed
- Removed console.log statements and debug code
- Fixed ERESOLVE conflict for html-react-parser
- Resolved DOMParser server-side issues in translation features
- Fixed chapter number conversion in metadata extraction
- Updated database queries for better performance
- Enhanced error handling in various components

### Security
- Enhanced theme synchronization for Disqus component
- Improved error handling in translation system
- Better form validation and error handling

## [2.13.1] - 2024-12-XX

### Changed
- Bumped cross-spawn from 7.0.3 to 7.0.6
- Updated dependencies for better compatibility

## [2.13.0] - 2024-12-XX

### Added
- Enhanced RSS feed functionality
- New logo and branding updates
- Discord integration improvements

### Changed
- Updated Next.js dependency to 14.2.29
- Enhanced chapter editing functionality
- Improved form validation and error handling

## [2.12.7] - 2024-12-XX

### Fixed
- Enhanced chapter editing functionality with improved form validation
- Fixed various UI and performance issues

## [2.12.6] - 2024-12-XX

### Added
- Validation for chapter creation and improved error handling
- Enhanced RSS feed functionality

## [2.12.5] - 2024-12-XX

### Fixed
- RSS feed functionality improvements

## [2.12.4] - 2024-12-XX

### Changed
- Updated embed content functionality

## [2.12.3] - 2024-12-XX

### Changed
- Updated to use MAIN_HOST for URL generation

## [2.12.2] - 2024-12-XX

### Added
- Discord post support functionality

## [2.12.1] - 2024-12-XX

### Changed
- Updated logo and branding
- Added join discord button in chapter pages
- Enhanced UI components

## [2.12.0] - 2024-12-XX

### Added
- Google AdSense support
- RSS feed improvements
- Enhanced logo and branding

## [2.11.0] - 2024-12-XX

### Changed
- Updated logo and branding
- Enhanced UI components

## [2.10.3] - 2024-12-XX

### Changed
- Made revalidate server-side action
- Enhanced functionality

## [2.10.2] - 2024-12-XX

### Added
- Revalidate functionality for chapters

## [2.10.1] - 2024-12-XX

### Changed
- Minor improvements and bug fixes

## [2.10.0] - 2024-12-XX

### Added
- Google AdSense support
- Enhanced functionality

## [2.9.4] - 2024-12-XX

### Changed
- Better UI in create chapter form
- Enhanced user experience

## [2.9.3] - 2024-12-XX

### Fixed
- Removed console.log statements
- Updated submit actions

## [2.9.2] - 2024-12-XX

### Fixed
- Removed useEffect dependencies
- Updated preview UI

## [2.9.1] - 2024-12-XX

### Changed
- Enhanced create novel page in admin

## [2.9.0] - 2024-12-XX

### Added
- Enhanced admin functionality
- Improved UI components

## [2.8.0] - 2024-12-XX

### Added
- Enhanced admin functionality
- Improved UI components

## [2.7.0] - 2024-12-XX

### Added
- Enhanced admin functionality
- Improved UI components

## [2.6.0] - 2024-12-XX

### Added
- Enhanced admin functionality
- Improved UI components

## [2.5.0] - 2024-12-XX

### Added
- Enhanced admin functionality
- Improved UI components

## [2.4.0] - 2024-12-XX

### Changed
- Removed Hygraph dependency
- Enhanced database functionality

## [2.3.0] - 2024-12-XX

### Added
- Enhanced database functionality
- Improved UI components

## [2.2.3] - 2024-12-XX

### Added
- Infinite scroll functionality
- Enhanced user experience

## [2.2.2] - 2024-12-XX

### Changed
- Updated chapter list with volume-based listing
- Enhanced UI components

## [2.2.1] - 2024-12-XX

### Fixed
- Removed loading states
- Enhanced footer positioning

## [2.2.0] - 2024-12-XX

### Added
- Sitemap functionality
- Enhanced SEO features

## [2.1.1] - 2024-12-XX

### Added
- Discord join alert
- Enhanced user engagement

## [2.1.0] - 2024-12-XX

### Added
- Enhanced user interface
- Improved navigation

## [2.0.7] - 2024-12-XX

### Fixed
- Enhanced content access restrictions
- Improved security

## [2.0.6] - 2024-12-XX

### Changed
- Enhanced database functionality
- Improved performance

## [2.0.5] - 2024-12-XX

### Changed
- Clerk without organization
- Enhanced authentication

## [2.0.4] - 2024-12-XX

### Fixed
- Important bug in LimitedContent component
- Enhanced functionality

## [2.0.3] - 2024-12-XX

### Changed
- Using nextjs/cache for better response
- Enhanced performance

## [2.0.2] - 2024-12-XX

### Fixed
- Updated create-chapter-form to update form after chapter is updated
- Enhanced functionality

## [2.0.1] - 2024-12-XX

### Fixed
- Updated timestamp for timezone support
- Enhanced functionality

## [2.0.0] - 2024-12-XX

### Added
- Complete rewrite with new architecture
- Enhanced database functionality
- Improved UI components
- Enhanced security features
- Better performance optimization

### Changed
- Complete refactor of the application
- Enhanced user experience
- Improved code quality

### Removed
- Legacy dependencies
- Outdated functionality

---

## [1.x.x] - 2024-12-XX and earlier

See git history for detailed changelog of earlier versions.