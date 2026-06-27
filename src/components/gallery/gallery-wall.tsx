"use client";

import {
  Badge,
  Box,
  Button,
  Circle,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuArrowLeft, LuExternalLink, LuRefreshCw } from "react-icons/lu";
import type { GalleryItem } from "@/lib/gallery";

type GalleryFilter = "all" | "photo" | "gif";

const accentTokens = [
  "booth.primary",
  "booth.secondary",
  "booth.yellow",
  "booth.navy",
  "booth.sky",
] as const;

const filterOptions: Array<{ id: GalleryFilter; label: string }> = [
  { id: "all", label: "All moments" },
  { id: "photo", label: "Photos" },
  { id: "gif", label: "GIFs" },
];

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

export function GalleryWall({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/gallery", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { items: GalleryItem[] };
      setItems(data.items);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, 20_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const visibleItems = useMemo(() => {
    if (filter === "gif") return items.filter((item) => item.isGif);
    if (filter === "photo") return items.filter((item) => !item.isGif);
    return items;
  }, [filter, items]);

  const gifCount = items.filter((item) => item.isGif).length;

  return (
    <Box as="main" id="main-content" bg="booth.bg" minH="100dvh">
      <Box bg="booth.fg" color="white" overflow="hidden">
        <Container maxW="7xl" px={{ base: "4", md: "8" }} py="4">
          <HStack justify="space-between" gap="4">
            <Link
              href="/"
              display="inline-flex"
              alignItems="center"
              gap="2"
              fontWeight="800"
              _hover={{ color: "booth.yellow" }}
            >
              <LuArrowLeft aria-hidden="true" />
              Back to booth
            </Link>
            <HStack gap="2">
              <Circle
                size="2.5"
                bg="booth.yellow"
                animation="gallery-live 1.6s ease-in-out infinite"
                _motionReduce={{ animation: "none" }}
              />
              <Text fontSize="sm" fontWeight="800">
                Live event wall
              </Text>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Box borderBottomWidth="1px" borderColor="booth.border">
        <Container
          maxW="7xl"
          px={{ base: "4", md: "8" }}
          py={{ base: "10", md: "16" }}
        >
          <Stack gap="8">
            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "start", lg: "end" }}
              gap="8"
            >
              <Stack gap="4" maxW="52rem">
                <Badge
                  alignSelf="start"
                  bg="booth.yellow"
                  color="booth.fg"
                  px="3"
                  py="1"
                  rounded="full"
                  fontWeight="900"
                >
                  KSF Fashion Show
                </Badge>
                <Heading
                  as="h1"
                  fontSize={{ base: "5xl", md: "7xl" }}
                  lineHeight="0.95"
                  letterSpacing="0"
                >
                  The runway wall.
                </Heading>
                <Text color="booth.muted" fontSize={{ base: "lg", md: "xl" }}>
                  Fresh poses, bold frames, and GIFs from the booth. New moments
                  appear here automatically.
                </Text>
              </Stack>

              <HStack gap={{ base: "6", md: "10" }}>
                <Stack gap="0">
                  <Text fontSize="3xl" fontWeight="950">
                    {items.length}
                  </Text>
                  <Text color="booth.muted" fontSize="sm">
                    Moments
                  </Text>
                </Stack>
                <Stack gap="0">
                  <Text fontSize="3xl" fontWeight="950">
                    {gifCount}
                  </Text>
                  <Text color="booth.muted" fontSize="sm">
                    Moving
                  </Text>
                </Stack>
              </HStack>
            </Flex>

            <Flex
              direction={{ base: "column", sm: "row" }}
              align={{ base: "stretch", sm: "center" }}
              justify="space-between"
              gap="4"
            >
              <HStack
                bg="booth.surface"
                borderWidth="1px"
                borderColor="booth.border"
                rounded="full"
                p="1"
                gap="1"
                overflowX="auto"
                aria-label="Filter gallery"
              >
                {filterOptions.map((option) => {
                  const selected = filter === option.id;
                  return (
                    <Button
                      key={option.id}
                      size="sm"
                      rounded="full"
                      flexShrink="0"
                      bg={selected ? "booth.fg" : "transparent"}
                      color={selected ? "white" : "booth.fg"}
                      aria-pressed={selected}
                      onClick={() => setFilter(option.id)}
                      _hover={{ bg: selected ? "booth.fg" : "booth.blush" }}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </HStack>

              <Button
                variant="outline"
                rounded="full"
                onClick={refresh}
                disabled={isRefreshing}
              >
                <LuRefreshCw aria-hidden="true" />
                {isRefreshing ? "Refreshing…" : "Refresh wall"}
              </Button>
            </Flex>
          </Stack>
        </Container>
      </Box>

      <Container maxW="7xl" px={{ base: "4", md: "8" }} py="10">
        {visibleItems.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="8">
            {visibleItems.map((item, index) => (
              <GalleryCard key={item.id} item={item} index={index} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyGallery filtered={items.length > 0} />
        )}
      </Container>
    </Box>
  );
}

function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  const accent = accentTokens[index % accentTokens.length];
  const aspectRatio = item.layout === "horizontal-strip" ? "4 / 3" : "1";
  const rotation =
    index % 3 === 0 ? "-0.6deg" : index % 3 === 1 ? "0.6deg" : "0deg";

  return (
    <Box
      as="article"
      bg="booth.surface"
      borderWidth="1px"
      borderColor="booth.border"
      borderTopWidth="8px"
      borderTopColor={accent}
      rounded="md"
      p="3"
      shadow="booth"
      transform={{ base: "none", md: `rotate(${rotation})` }}
      transition="transform 180ms ease, box-shadow 180ms ease"
      animation="gallery-reveal 500ms ease both"
      animationDelay={`${Math.min(index, 8) * 70}ms`}
      contentVisibility="auto"
      _hover={{ transform: "rotate(0deg) translateY(-6px)", shadow: "xl" }}
      _motionReduce={{ animation: "none", transition: "none" }}
    >
      <Link
        href={item.assetUrl}
        target="_blank"
        rel="noopener noreferrer"
        display="block"
        aria-label={`Open ${item.isGif ? "GIF" : "photo"} in a new tab`}
      >
        <Box position="relative" overflow="hidden" rounded="sm" bg="booth.fg">
          <Image
            src={item.assetUrl}
            alt={
              item.caption
                ? `${item.caption} — KSF Fashion Show booth moment`
                : "KSF Fashion Show booth moment"
            }
            htmlWidth="1200"
            htmlHeight="1200"
            w="100%"
            aspectRatio={aspectRatio}
            objectFit="cover"
            loading="lazy"
          />
          <Badge
            position="absolute"
            top="3"
            left="3"
            bg={item.isGif ? "booth.yellow" : "booth.surface"}
            color="booth.fg"
            rounded="full"
            px="3"
            py="1"
            fontWeight="900"
          >
            {item.isGif ? "GIF" : "PHOTO"}
          </Badge>
        </Box>
      </Link>

      <HStack
        justify="space-between"
        align="start"
        gap="4"
        pt="4"
        px="1"
        pb="1"
      >
        <Stack gap="1" minW="0">
          <Text fontWeight="900" lineClamp={2}>
            {item.caption || "Fresh from the booth"}
          </Text>
          <Text color="booth.muted" fontSize="sm">
            {timeFormatter.format(new Date(item.createdAt))}
          </Text>
        </Stack>
        <Box color="booth.muted" pt="1" flexShrink="0">
          <LuExternalLink aria-hidden="true" />
        </Box>
      </HStack>
    </Box>
  );
}

function EmptyGallery({ filtered }: { filtered: boolean }) {
  return (
    <Stack
      align="center"
      textAlign="center"
      gap="6"
      py={{ base: "14", md: "20" }}
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="booth.border"
      rounded="control"
    >
      <HStack gap="3" aria-hidden="true">
        {accentTokens.map((color, index) => (
          <Box
            key={color}
            bg={color}
            w={{ base: "10", md: "14" }}
            aspectRatio="1"
            rounded="sm"
            transform={`rotate(${(index - 2) * 4}deg)`}
          />
        ))}
      </HStack>
      <Stack gap="2" maxW="30rem">
        <Heading size="2xl">
          {filtered ? "No moments in this cut yet." : "The wall is warming up."}
        </Heading>
        <Text color="booth.muted">
          {filtered
            ? "Try another filter to see what the crowd has made."
            : "Finish a booth session and keep “Show in event gallery” on to make the first appearance."}
        </Text>
      </Stack>
      <Button asChild bg="booth.primary" color="white" rounded="full">
        <Link href="/">Take the first shot</Link>
      </Button>
    </Stack>
  );
}
