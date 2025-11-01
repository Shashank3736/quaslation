/**
 * Performance optimization utilities for the neobrutalism UI
 */

/**
 * Preload critical CSS for neobrutalism styles
 * Call this in the root layout to ensure styles are loaded early
 */
export function preloadCriticalStyles() {
  if (typeof window === 'undefined') return

  // Preload font files if using custom fonts
  const fontLinks = document.querySelectorAll('link[rel="stylesheet"]')
  fontLinks.forEach((link) => {
    if (link instanceof HTMLLinkElement) {
      link.rel = 'preload'
      link.as = 'style'
    }
  })
}

/**
 * Optimize shadow rendering by using CSS containment
 * This helps the browser optimize paint and layout operations
 */
export function optimizeShadowRendering(element: HTMLElement) {
  if (!element) return

  // Use CSS containment for better performance
  element.style.contain = 'layout style paint'
  
  // Enable GPU acceleration
  element.style.transform = 'translateZ(0)'
  element.style.backfaceVisibility = 'hidden'
}

/**
 * Debounce function for performance-sensitive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for scroll and resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    })

    observer.observe(img)
  } else {
    // Fallback for browsers without Intersection Observer
    img.src = src
  }
}

/**
 * Prevent layout shift by reserving space for elements
 */
export function preventLayoutShift(
  element: HTMLElement,
  width: number,
  height: number
) {
  element.style.minWidth = `${width}px`
  element.style.minHeight = `${height}px`
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Optimize animations based on user preferences
 */
export function optimizeAnimation(element: HTMLElement) {
  if (prefersReducedMotion()) {
    element.style.animation = 'none'
    element.style.transition = 'none'
  }
}

/**
 * Monitor Core Web Vitals
 */
export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // You can send to your analytics service here
    // Example: analytics.track('web-vital', metric)
  }
}
