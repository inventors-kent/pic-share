"use client";

import { Box, Image } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/gallery";

const defaultBackground = "/images/ksf-event-hero.jpeg";
const slideDurationMs = 3_000;
const galleryRefreshMs = 15_000;
const crossfadeDurationMs = 900;
const maxSlides = 12;
const layerIds = ["backdrop-a", "backdrop-b"] as const;

type BackgroundSlide = Pick<GalleryItem, "id" | "assetUrl">;
type LayerIndex = 0 | 1;

export function EventBackdrop() {
  const [slides, setSlides] = useState<BackgroundSlide[]>([]);
  const [layerUrls, setLayerUrls] = useState<[string, string]>([
    defaultBackground,
    defaultBackground,
  ]);
  const [activeLayer, setActiveLayer] = useState<LayerIndex>(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const activeLayerRef = useRef<LayerIndex>(0);
  const currentIndexRef = useRef(0);
  const layerUrlsRef = useRef(layerUrls);
  const slidesRef = useRef(slides);
  const transitionLockedRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const transitionTo = useCallback((url: string, index: number) => {
    const currentUrl = layerUrlsRef.current[activeLayerRef.current];
    if (url === currentUrl) {
      currentIndexRef.current = index;
      return;
    }
    if (transitionLockedRef.current) return;

    transitionLockedRef.current = true;
    const preloader = new window.Image();

    preloader.onload = () => {
      if (!mountedRef.current) return;
      const nextLayer: LayerIndex = activeLayerRef.current === 0 ? 1 : 0;
      const nextUrls: [string, string] = [...layerUrlsRef.current];
      nextUrls[nextLayer] = url;
      layerUrlsRef.current = nextUrls;
      setLayerUrls(nextUrls);

      window.requestAnimationFrame(() => {
        if (!mountedRef.current) return;
        activeLayerRef.current = nextLayer;
        currentIndexRef.current = index;
        setActiveLayer(nextLayer);
        transitionTimerRef.current = window.setTimeout(() => {
          transitionLockedRef.current = false;
        }, crossfadeDurationMs);
      });
    };

    preloader.onerror = () => {
      transitionLockedRef.current = false;
    };
    preloader.src = url;
  }, []);

  const loadGallerySlides = useCallback(async () => {
    try {
      const response = await fetch("/api/gallery", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { items: GalleryItem[] };
      const nextSlides = data.items
        .filter((item) => item.assetUrl)
        .slice(0, maxSlides)
        .map(({ id, assetUrl }) => ({ id, assetUrl }));

      slidesRef.current = nextSlides;
      setSlides(nextSlides);

      if (nextSlides.length === 0) {
        transitionTo(defaultBackground, 0);
        return;
      }

      const currentUrl = layerUrlsRef.current[activeLayerRef.current];
      const currentIndex = nextSlides.findIndex(
        (slide) => slide.assetUrl === currentUrl,
      );

      if (currentIndex >= 0) {
        currentIndexRef.current = currentIndex;
      } else {
        transitionTo(nextSlides[0].assetUrl, 0);
      }
    } catch {
      // Keep the current backdrop when the gallery is temporarily unavailable.
    }
  }, [transitionTo]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    void loadGallerySlides();
    const refreshInterval = window.setInterval(
      loadGallerySlides,
      galleryRefreshMs,
    );
    return () => window.clearInterval(refreshInterval);
  }, [loadGallerySlides]);

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;

    const slideInterval = window.setInterval(() => {
      const availableSlides = slidesRef.current;
      if (availableSlides.length <= 1 || transitionLockedRef.current) return;
      const nextIndex = (currentIndexRef.current + 1) % availableSlides.length;
      transitionTo(availableSlides[nextIndex].assetUrl, nextIndex);
    }, slideDurationMs);

    return () => window.clearInterval(slideInterval);
  }, [reduceMotion, slides.length, transitionTo]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  return (
    <Box position="absolute" inset="0" aria-hidden="true">
      {layerIds.map((layerId, index) => {
        const url = layerUrls[index];
        const isActive = activeLayer === index;
        const isDefault = url === defaultBackground;

        return (
          <Image
            key={layerId}
            src={url}
            alt=""
            htmlWidth={isDefault ? "1746" : "1200"}
            htmlHeight={isDefault ? "1744" : "1200"}
            position="absolute"
            inset="0"
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition={
              isDefault ? { base: "56% center", md: "center" } : "center"
            }
            opacity={isActive ? 1 : 0}
            loading={isActive ? "eager" : "lazy"}
            fetchPriority={isActive ? "high" : "auto"}
            transition={`opacity ${crossfadeDurationMs}ms ease`}
            animation="event-film 16s ease-in-out infinite"
            _motionReduce={{ animation: "none", transition: "none" }}
          />
        );
      })}
    </Box>
  );
}
