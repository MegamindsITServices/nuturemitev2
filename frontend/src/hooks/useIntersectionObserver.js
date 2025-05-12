import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for detecting when an element enters the viewport
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Percentage of element visibility needed to trigger callback (0-1)
 * @param {string} options.rootMargin - Margin around the root element
 * @param {boolean} options.triggerOnce - Whether to disconnect the observer after the element has been intersected
 * @returns {Array} [ref, isIntersecting, observer] - The ref to attach, whether element is intersecting, and observer instance
 */
const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true
} = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (hasTriggered && triggerOnce) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting && triggerOnce) {
          setHasTriggered(true);
          // Clean up the observer if we only want to trigger once
          if (elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
          }
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = elementRef.current;
    const currentObserver = observerRef.current;

    if (currentRef) {
      currentObserver.observe(currentRef);
    }

    return () => {
      if (currentRef && currentObserver) {
        currentObserver.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return [elementRef, isIntersecting, observerRef.current];
};

export default useIntersectionObserver;
