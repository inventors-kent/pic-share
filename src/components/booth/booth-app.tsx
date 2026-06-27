"use client";

import {
  Badge,
  Box,
  Button,
  Circle,
  Container,
  chakra,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {
  LuCamera,
  LuCheck,
  LuMail,
  LuPartyPopper,
  LuQrCode,
  LuRefreshCcw,
  LuSparkles,
} from "react-icons/lu";
import QRCode from "react-qr-code";
import {
  type AccentColorId,
  type BoothLayout,
  boothConfig,
  type FrameStyle,
  frameOptions,
  type GifSpeed,
  layoutOptions,
  type StickerPresetId,
} from "@/lib/booth-config";
import {
  type BoothCustomization,
  type CapturedPhoto,
  useBoothStore,
} from "@/lib/booth-store";
import { composeFinalImage, createGifPreview } from "@/lib/canvas-compose";
import {
  playShutterSound,
  primeShutterSound,
  stopShutterSound,
} from "@/lib/shutter-sound";

const Video = chakra("video");
const photoSlotKeys = Array.from(
  { length: boothConfig.photoCount },
  (_, index) => `photo-slot-${index + 1}`,
);
const posePrompts = ["Look up", "Go bold", "Switch sides", "Big finish"];

export function BoothApp() {
  const [mounted, setMounted] = useState(false);
  const step = useBoothStore((state) => state.step);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Link
        href="#main-content"
        position="fixed"
        top="4"
        left="4"
        zIndex="skipNav"
        bg="booth.fg"
        color="white"
        px="4"
        py="2"
        rounded="full"
        fontWeight="900"
        transform="translateY(-160%)"
        _focusVisible={{ transform: "translateY(0)" }}
      >
        Skip to main content
      </Link>
      <Box
        as="main"
        id="main-content"
        tabIndex={-1}
        bg="booth.bg"
        minH="100dvh"
        overflowX="hidden"
      >
        {step === "start" && <StartScreen />}
        {step === "camera" && <CameraScreen />}
        {step === "review" && <ReviewScreen />}
        {step === "customize" && <CustomizeScreen />}
        {step === "generating" && <GeneratingScreen />}
        {step === "share" && <ShareScreen />}
        {step === "error" && <ErrorScreen />}
      </Box>
    </>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <Container
      maxW="7xl"
      px={{ base: "4", md: "8" }}
      py={{ base: "5", md: "8" }}
    >
      {children}
    </Container>
  );
}

function StartScreen() {
  const setStep = useBoothStore((state) => state.setStep);

  return (
    <PageShell>
      <Grid
        minH={{ base: "auto", md: "calc(100dvh - 64px)" }}
        alignItems="center"
        gap={{ base: "8", lg: "12" }}
        templateColumns={{ base: "1fr", lg: "0.95fr 1.05fr" }}
      >
        <Stack gap="8">
          <HStack gap="3">
            <Circle bg="booth.primary" color="white" size="12">
              <Icon as={LuCamera} boxSize="6" aria-hidden="true" />
            </Circle>
            <Stack gap="0">
              <Text fontWeight="800" fontSize="lg">
                {boothConfig.productName}
              </Text>
              <Text color="booth.muted" fontSize="sm">
                {boothConfig.eventName}
              </Text>
            </Stack>
          </HStack>

          <Stack gap="5">
            <Heading
              as="h1"
              color="booth.fg"
              fontSize={{ base: "5xl", md: "7xl" }}
              lineHeight="0.92"
              letterSpacing="0"
              maxW="11ch"
            >
              Step in. Pose big. Take the moment home.
            </Heading>
            <Text
              color="booth.muted"
              fontSize={{ base: "lg", md: "xl" }}
              maxW="36rem"
            >
              A quick 4-shot booth session with playful frames, instant QR
              downloads, and an optional email backup.
            </Text>
          </Stack>

          <Stack gap="4" maxW="34rem">
            <Button
              bg="booth.primary"
              color="white"
              size="2xl"
              minH="72px"
              shadow="button"
              rounded="full"
              fontWeight="900"
              onClick={() => setStep("camera")}
            >
              <LuSparkles />
              Start booth
            </Button>
            <Text color="booth.muted" fontSize="sm">
              By continuing, guests agree that photos are used to generate and
              deliver their private booth download link. Links expire after 24
              hours.
            </Text>
          </Stack>
        </Stack>

        <Box
          bg="booth.surface"
          rounded="booth"
          shadow="booth"
          borderWidth="1px"
          borderColor="booth.border"
          p={{ base: "4", md: "6" }}
        >
          <Box
            bg="booth.ink"
            rounded="booth"
            minH={{ base: "360px", md: "620px" }}
            position="relative"
            overflow="hidden"
          >
            <SimpleGrid columns={2} gap="4" p="5" opacity="0.95">
              {["#EE5B54", "#009688", "#FFDE39", "#18364A"].map(
                (color, index) => (
                  <Box
                    key={color}
                    bg={color}
                    rounded="control"
                    aspectRatio="1"
                    borderWidth="8px"
                    borderColor="white"
                    transform={index % 2 ? "translateY(28px)" : "none"}
                  />
                ),
              )}
            </SimpleGrid>
            <VStack
              position="absolute"
              insetX="6"
              bottom="6"
              bg="rgba(255, 255, 255, 0.94)"
              rounded="control"
              p="5"
              align="stretch"
              gap="4"
            >
              <HStack justify="space-between">
                <Badge
                  bg="booth.secondary"
                  color="booth.fg"
                  px="3"
                  py="1"
                  rounded="full"
                >
                  4-shot burst
                </Badge>
                <HStack gap="2">
                  {photoSlotKeys.map((slotKey, index) => (
                    <Circle
                      key={slotKey}
                      size="3"
                      bg={index === 0 ? "booth.primary" : "booth.border"}
                    />
                  ))}
                </HStack>
              </HStack>
              <Text fontWeight="800" fontSize={{ base: "lg", md: "2xl" }}>
                Ready for the next guest
              </Text>
            </VStack>
          </Box>
        </Box>
      </Grid>
    </PageShell>
  );
}

function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "counting">(
    "loading",
  );
  const [countdown, setCountdown] = useState(boothConfig.countdownSeconds);
  const [flash, setFlash] = useState(false);
  const photos = useBoothStore((state) => state.photos);
  const retakeIndex = useBoothStore((state) => state.retakeIndex);
  const addPhoto = useBoothStore((state) => state.addPhoto);
  const replacePhoto = useBoothStore((state) => state.replacePhoto);
  const setStep = useBoothStore((state) => state.setStep);
  const setError = useBoothStore((state) => state.setError);
  const capturedCount = photos.length;
  const remainingShots =
    retakeIndex === null ? boothConfig.photoCount - capturedCount : 1;
  const currentShotNumber =
    retakeIndex === null
      ? Math.min(capturedCount + 1, boothConfig.photoCount)
      : retakeIndex + 1;
  const posePrompt = posePrompts[(currentShotNumber - 1) % posePrompts.length];

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1600 },
            height: { ideal: 1200 },
          },
          audio: false,
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("ready");
      } catch {
        setError(
          "Camera access is needed for the booth. Check the iPad camera permission and try again.",
        );
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopShutterSound();
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [setError]);

  function capturePhoto(): CapturedPhoto | null {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return null;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return {
      id: crypto.randomUUID(),
      dataUrl: canvas.toDataURL("image/jpeg", 0.9),
      createdAt: Date.now(),
    };
  }

  async function runBurst() {
    setStatus("counting");
    void primeShutterSound();

    for (
      let shotIndex = 0;
      shotIndex <
      (retakeIndex === null ? boothConfig.photoCount - photos.length : 1);
      shotIndex += 1
    ) {
      for (let second = boothConfig.countdownSeconds; second > 0; second -= 1) {
        setCountdown(second);
        await new Promise((resolve) => setTimeout(resolve, 760));
      }

      const photo = capturePhoto();
      void playShutterSound();
      if (photo) {
        if (retakeIndex === null) {
          addPhoto(photo);
        } else {
          replacePhoto(retakeIndex, photo);
        }
      }
      setFlash(true);
      await new Promise((resolve) => setTimeout(resolve, 180));
      setFlash(false);
    }

    stopShutterSound();
    setStep("review");
  }

  return (
    <PageShell>
      <Grid
        gap="6"
        templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 430px" }}
        alignItems="stretch"
      >
        <Box
          bg="booth.ink"
          rounded="booth"
          minH={{ base: "62dvh", lg: "calc(100dvh - 64px)" }}
          overflow="hidden"
          position="relative"
          shadow="booth"
        >
          <Video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            w="100%"
            h="100%"
            minH={{ base: "62dvh", lg: "calc(100dvh - 64px)" }}
            objectFit="cover"
            transform={boothConfig.mirrorPreview ? "scaleX(-1)" : "none"}
          />
          {status === "counting" && (
            <Circle
              position="absolute"
              inset="50% auto auto 50%"
              transform="translate(-50%, -50%)"
              size={{ base: "156px", md: "210px" }}
              bg="rgba(255, 255, 255, 0.92)"
              color="booth.primary"
              fontSize={{ base: "7xl", md: "8xl" }}
              fontWeight="900"
            >
              {countdown}
            </Circle>
          )}
          {flash && (
            <Box position="absolute" inset="0" bg="white" opacity="0.82" />
          )}
        </Box>

        <Stack
          bg="booth.surface"
          rounded="booth"
          borderWidth="1px"
          borderColor="booth.border"
          p="6"
          gap="7"
          justify="space-between"
        >
          <Stack gap="5">
            <HStack justify="space-between" align="start" gap="4">
              <Stack gap="3">
                <Badge
                  bg="booth.secondary"
                  color="booth.fg"
                  rounded="full"
                  px="3"
                  py="1"
                  alignSelf="flex-start"
                >
                  {retakeIndex === null
                    ? "Capture burst"
                    : `Retake photo ${retakeIndex + 1}`}
                </Badge>
                <Heading size="3xl" lineHeight="1">
                  Give it a little drama.
                </Heading>
              </Stack>
              <Circle bg="booth.surfaceTint" color="booth.primary" size="12">
                <Icon as={LuPartyPopper} boxSize="6" />
              </Circle>
            </HStack>

            <Box
              bg="booth.surfaceTint"
              rounded="control"
              borderWidth="1px"
              borderColor="booth.border"
              p="5"
            >
              <HStack justify="space-between" align="center">
                <Stack gap="1">
                  <Text color="booth.muted" fontSize="sm" fontWeight="800">
                    Current shot
                  </Text>
                  <Text fontSize="4xl" fontWeight="950" lineHeight="1">
                    {currentShotNumber}
                    <Text as="span" color="booth.muted" fontSize="xl">
                      /{boothConfig.photoCount}
                    </Text>
                  </Text>
                </Stack>
                <Stack gap="1" textAlign="right">
                  <Text color="booth.muted" fontSize="sm" fontWeight="800">
                    Pose cue
                  </Text>
                  <Text fontSize="2xl" fontWeight="900">
                    {status === "counting" ? countdown : posePrompt}
                  </Text>
                </Stack>
              </HStack>
            </Box>
          </Stack>

          <Stack gap="4">
            <HStack justify="space-between">
              <Text fontWeight="900">Burst progress</Text>
              <Text color="booth.muted" fontSize="sm" fontWeight="800">
                {remainingShots} to go
              </Text>
            </HStack>
            <SimpleGrid columns={4} gap="3">
              {photoSlotKeys.map((slotKey, index) => {
                const isCaptured = index < capturedCount;
                const isCurrent = index === currentShotNumber - 1;

                return (
                  <Stack key={slotKey} gap="2" align="center">
                    <Box
                      h="3"
                      w="100%"
                      rounded="full"
                      bg={isCaptured ? "booth.primary" : "booth.border"}
                      outline={isCurrent ? "3px solid" : "none"}
                      outlineColor="booth.yellow"
                    />
                    <Text
                      color={
                        isCaptured || isCurrent ? "booth.fg" : "booth.muted"
                      }
                      fontSize="xs"
                      fontWeight="900"
                    >
                      {index + 1}
                    </Text>
                  </Stack>
                );
              })}
            </SimpleGrid>
          </Stack>

          <SimpleGrid columns={2} gap="2">
            {["Countdown", "Flash", "Shutter", "Review"].map((label) => (
              <HStack
                key={label}
                bg="booth.surfaceTint"
                rounded="full"
                borderWidth="1px"
                borderColor="transparent"
                px="2.5"
                py="1.5"
                gap="2"
                opacity="0.72"
              >
                <Circle size="1.5" bg="booth.primary" opacity="0.75" />
                <Text color="booth.muted" fontSize="xs" fontWeight="700">
                  {label}
                </Text>
              </HStack>
            ))}
          </SimpleGrid>

          <Button
            size="2xl"
            minH="72px"
            rounded="full"
            bg="booth.primary"
            color="white"
            disabled={status !== "ready"}
            onClick={runBurst}
          >
            <LuCamera />
            {status === "loading" ? "Opening camera…" : "Start countdown"}
          </Button>
        </Stack>
      </Grid>
    </PageShell>
  );
}

function ReviewScreen() {
  const photos = useBoothStore((state) => state.photos);
  const setRetakeIndex = useBoothStore((state) => state.setRetakeIndex);
  const setStep = useBoothStore((state) => state.setStep);

  return (
    <PageShell>
      <Stack gap="7">
        <HStack justify="space-between" align="start" gap="4" flexWrap="wrap">
          <Stack gap="2">
            <Heading size="4xl">Keep the winners.</Heading>
            <Text color="booth.muted" fontSize="lg">
              Retake any single shot, then style the whole set.
            </Text>
          </Stack>
          <Button
            size="xl"
            rounded="full"
            bg="booth.primary"
            color="white"
            onClick={() => setStep("customize")}
          >
            Customize
            <LuSparkles />
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="5">
          {photos.map((photo, index) => (
            <Box
              key={photo.id}
              bg="booth.surface"
              rounded="booth"
              p="3"
              borderWidth="1px"
              borderColor="booth.border"
              shadow="booth"
            >
              <Image
                src={photo.dataUrl}
                alt={`Captured photo ${index + 1}`}
                htmlWidth="960"
                htmlHeight="1200"
                rounded="control"
                aspectRatio="4 / 5"
                objectFit="cover"
              />
              <Button
                mt="3"
                w="100%"
                rounded="full"
                variant="outline"
                onClick={() => {
                  setRetakeIndex(index);
                  setStep("camera");
                }}
              >
                <LuRefreshCcw aria-hidden="true" />
                Retake
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </PageShell>
  );
}

function OptionButton<T extends string>({
  value,
  selected,
  children,
  onSelect,
}: {
  value: T;
  selected: boolean;
  children: React.ReactNode;
  onSelect: (value: T) => void;
}) {
  return (
    <Button
      variant={selected ? "solid" : "outline"}
      bg={selected ? "booth.fg" : "transparent"}
      color={selected ? "white" : "booth.fg"}
      borderColor="booth.border"
      rounded="full"
      onClick={() => onSelect(value)}
    >
      {children}
    </Button>
  );
}

function CustomizeScreen() {
  const photos = useBoothStore((state) => state.photos);
  const customization = useBoothStore((state) => state.customization);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [gifFrameIndex, setGifFrameIndex] = useState(0);
  const [previewStatus, setPreviewStatus] = useState<"loading" | "ready">(
    "loading",
  );
  const updateCustomization = useBoothStore(
    (state) => state.updateCustomization,
  );
  const setGeneratedDataUrl = useBoothStore(
    (state) => state.setGeneratedDataUrl,
  );
  const setShareResult = useBoothStore((state) => state.setShareResult);
  const setStep = useBoothStore((state) => state.setStep);
  const setError = useBoothStore((state) => state.setError);

  useEffect(() => {
    let cancelled = false;
    setPreviewStatus("loading");

    composeFinalImage(photos, customization)
      .then((result) => {
        if (!cancelled) {
          setPreviewDataUrl(result.dataUrl);
          setPreviewStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewDataUrl(null);
          setPreviewStatus("ready");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [photos, customization]);

  useEffect(() => {
    if (customization.layout !== "gif" || photos.length <= 1) {
      setGifFrameIndex(0);
      return;
    }

    const delay = {
      slow: 850,
      normal: 520,
      fast: 280,
    }[customization.gifSpeed];

    const interval = window.setInterval(() => {
      setGifFrameIndex((index) => (index + 1) % photos.length);
    }, delay);

    return () => window.clearInterval(interval);
  }, [customization.gifSpeed, customization.layout, photos.length]);

  async function generate() {
    try {
      setStep("generating");
      const result = await composeFinalImage(photos, customization);
      const gifPreview =
        customization.layout === "gif"
          ? await createGifPreview(photos, customization)
          : undefined;
      setGeneratedDataUrl(gifPreview ?? result.dataUrl);

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalAssetDataUrl: result.dataUrl,
          gifAssetDataUrl: gifPreview,
          sourcePhotoDataUrls: photos.map((photo) => photo.dataUrl),
          layout: customization.layout,
          customization,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          errorBody?.error || "The share link could not be created.",
        );
      }

      const share = await response.json();
      setShareResult({ ...share, emailStatus: "idle" });
      setStep("share");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The booth output could not be generated.",
      );
    }
  }

  return (
    <PageShell>
      <Grid
        gap="6"
        templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 430px" }}
        alignItems="start"
      >
        <Box
          bg="booth.surface"
          rounded="booth"
          p="4"
          borderWidth="1px"
          borderColor="booth.border"
          shadow="booth"
          alignSelf="start"
        >
          <Stack gap="4">
            <HStack justify="space-between" gap="3" flexWrap="wrap">
              <Stack gap="0">
                <Text fontWeight="900">Live preview</Text>
                <Text color="booth.muted" fontSize="sm">
                  Updates as you choose styles.
                </Text>
              </Stack>
              <Badge
                bg={
                  previewStatus === "loading"
                    ? "booth.yellow"
                    : "booth.secondary"
                }
                color="booth.fg"
                rounded="full"
                px="3"
                py="1"
                aria-live="polite"
              >
                {previewStatus === "loading" ? "Updating…" : "Ready"}
              </Badge>
            </HStack>

            <Flex
              bg="booth.surfaceTint"
              rounded="control"
              borderWidth="1px"
              borderColor="booth.border"
              minH={{ base: "320px", md: "520px" }}
              align="center"
              justify="center"
              p={{ base: "3", md: "5" }}
            >
              {previewDataUrl ? (
                customization.layout === "gif" ? (
                  <AnimatedGifPreview
                    photo={photos[gifFrameIndex] ?? photos[0]}
                    customization={customization}
                    frameLabel={`${gifFrameIndex + 1} / ${photos.length}`}
                  />
                ) : (
                  <Image
                    src={previewDataUrl}
                    alt="Live styled booth preview"
                    htmlWidth="1400"
                    htmlHeight="1400"
                    rounded="control"
                    maxH={{ base: "520px", lg: "calc(100dvh - 180px)" }}
                    maxW="100%"
                    objectFit="contain"
                    shadow="booth"
                  />
                )
              ) : (
                <SimpleGrid
                  columns={customization.layout === "horizontal-strip" ? 4 : 2}
                  gap="3"
                  w="100%"
                >
                  {photos.map((photo, index) => (
                    <Image
                      key={photo.id}
                      src={photo.dataUrl}
                      alt={`Preview photo ${index + 1}`}
                      htmlWidth="960"
                      htmlHeight="960"
                      rounded="control"
                      aspectRatio={
                        customization.layout === "horizontal-strip"
                          ? "3 / 4"
                          : "1"
                      }
                      objectFit="cover"
                    />
                  ))}
                </SimpleGrid>
              )}
            </Flex>
          </Stack>
        </Box>

        <Stack
          bg="booth.surface"
          rounded="booth"
          borderWidth="1px"
          borderColor="booth.border"
          p="6"
          gap="6"
        >
          <Stack gap="1">
            <Heading size="3xl">Make it yours.</Heading>
            <Text color="booth.muted">
              Choose a layout, frame, color, and a little booth personality.
            </Text>
          </Stack>

          <ControlGroup label="Layout">
            <Flex gap="2" wrap="wrap">
              {layoutOptions.map((option) => (
                <OptionButton<BoothLayout>
                  key={option.id}
                  value={option.id}
                  selected={customization.layout === option.id}
                  onSelect={(layout) => updateCustomization({ layout })}
                >
                  {option.label}
                </OptionButton>
              ))}
            </Flex>
          </ControlGroup>

          <ControlGroup label="Frame">
            <Flex gap="2" wrap="wrap">
              {frameOptions.map((option) => (
                <OptionButton<FrameStyle>
                  key={option.id}
                  value={option.id}
                  selected={customization.frame === option.id}
                  onSelect={(frame) => updateCustomization({ frame })}
                >
                  {option.label}
                </OptionButton>
              ))}
            </Flex>
          </ControlGroup>

          <ControlGroup label="Color">
            <HStack gap="3" flexWrap="wrap">
              {boothConfig.accentColors.map((color) => (
                <IconButton
                  key={color.id}
                  aria-label={color.label}
                  rounded="full"
                  size="lg"
                  bg={color.value}
                  borderWidth={
                    customization.accentColor === color.id ? "4px" : "1px"
                  }
                  borderColor={
                    customization.accentColor === color.id
                      ? "booth.fg"
                      : "booth.border"
                  }
                  onClick={() =>
                    updateCustomization({
                      accentColor: color.id as AccentColorId,
                    })
                  }
                >
                  {customization.accentColor === color.id ? <LuCheck /> : null}
                </IconButton>
              ))}
            </HStack>
          </ControlGroup>

          <ControlGroup label="Sticker preset">
            <Flex gap="2" wrap="wrap">
              {boothConfig.stickerPresets.map((preset) => (
                <OptionButton<StickerPresetId>
                  key={preset.id}
                  value={preset.id}
                  selected={customization.stickerPreset === preset.id}
                  onSelect={(stickerPreset) =>
                    updateCustomization({ stickerPreset })
                  }
                >
                  {preset.label}
                </OptionButton>
              ))}
            </Flex>
          </ControlGroup>

          <Field.Root>
            <Field.Label>Caption</Field.Label>
            <Textarea
              value={customization.caption}
              name="caption"
              placeholder={`${boothConfig.eventName} forever…`}
              onChange={(event) =>
                updateCustomization({ caption: event.target.value })
              }
              rounded="control"
              maxLength={70}
            />
          </Field.Root>

          {customization.layout === "gif" && (
            <ControlGroup label="GIF speed">
              <Flex gap="2" wrap="wrap">
                {(["slow", "normal", "fast"] as GifSpeed[]).map((speed) => (
                  <OptionButton<GifSpeed>
                    key={speed}
                    value={speed}
                    selected={customization.gifSpeed === speed}
                    onSelect={(gifSpeed) => updateCustomization({ gifSpeed })}
                  >
                    {speed}
                  </OptionButton>
                ))}
              </Flex>
            </ControlGroup>
          )}

          <HStack>
            <Button
              variant="outline"
              rounded="full"
              onClick={() => setStep("review")}
            >
              Back to photos
            </Button>
            <Button
              flex="1"
              bg="booth.primary"
              color="white"
              rounded="full"
              onClick={generate}
            >
              Generate and share
              <LuQrCode />
            </Button>
          </HStack>
        </Stack>
      </Grid>
    </PageShell>
  );
}

function AnimatedGifPreview({
  photo,
  customization,
  frameLabel,
}: {
  photo: CapturedPhoto;
  customization: BoothCustomization;
  frameLabel: string;
}) {
  const accent =
    boothConfig.accentColors.find(
      (color) => color.id === customization.accentColor,
    )?.value ?? "#EE5B54";

  return (
    <Stack
      bg={customization.frame === "clean" ? "white" : accent}
      rounded="booth"
      p={{ base: "4", md: "6" }}
      gap="4"
      w="min(100%, 560px)"
      shadow="booth"
      position="relative"
    >
      <Box position="relative" overflow="hidden" rounded="control">
        <Image
          key={photo.id}
          src={photo.dataUrl}
          alt="Animated GIF frame preview"
          htmlWidth="640"
          htmlHeight="640"
          aspectRatio="1"
          objectFit="cover"
          w="100%"
        />
        {customization.frame === "confetti" && <ConfettiOverlay />}
        <StickerOverlay preset={customization.stickerPreset} />
      </Box>

      <HStack justify="space-between" gap="3">
        <Text fontWeight="900" color="booth.fg" lineClamp={1}>
          {customization.caption.trim() || boothConfig.eventName}
        </Text>
        <Badge bg="white" color="booth.fg" rounded="full" px="3" py="1">
          GIF {frameLabel}
        </Badge>
      </HStack>
    </Stack>
  );
}

function ConfettiOverlay() {
  const pieces = Array.from({ length: 34 }, (_, index) => {
    const edge = index % 4;
    const color = [
      "booth.primary",
      "booth.secondary",
      "booth.yellow",
      "booth.navy",
      "booth.sky",
    ][index % 5];
    const offset = `${8 + ((index * 17) % 76)}%`;
    const inset = `${2 + ((index * 11) % 16)}%`;
    const size = `${8 + (index % 5) * 3}px`;

    return {
      id: `confetti-${index}`,
      color,
      height: index % 3 === 0 ? size : "7px",
      left: edge === 0 || edge === 2 ? offset : edge === 3 ? inset : "auto",
      right: edge === 1 ? inset : "auto",
      top: edge === 0 ? inset : edge === 1 || edge === 3 ? offset : "auto",
      bottom: edge === 2 ? inset : "auto",
      transform: `rotate(${(index * 29) % 160}deg)`,
      width: index % 4 === 0 ? size : `${14 + (index % 6) * 4}px`,
    };
  });

  return (
    <Box position="absolute" inset="0" pointerEvents="none">
      {pieces.map((piece) => (
        <Box
          key={piece.id}
          position="absolute"
          bg={piece.color}
          top={piece.top}
          right={piece.right}
          bottom={piece.bottom}
          left={piece.left}
          w={piece.width}
          h={piece.height}
          rounded={piece.width === piece.height ? "full" : "2px"}
          transform={piece.transform}
          shadow="0 1px 2px rgba(24, 32, 38, 0.18)"
        />
      ))}
    </Box>
  );
}

function StickerOverlay({ preset }: { preset: StickerPresetId }) {
  const symbol = {
    hearts: "♥",
    sparkles: "✦",
    stars: "★",
  }[preset];

  if (!symbol) return null;

  return (
    <>
      <Text
        position="absolute"
        top="3"
        left="4"
        color="booth.primary"
        fontSize="5xl"
        fontWeight="900"
        lineHeight="1"
      >
        {symbol}
      </Text>
      <Text
        position="absolute"
        right="4"
        bottom="3"
        color="booth.yellow"
        fontSize="4xl"
        fontWeight="900"
        lineHeight="1"
      >
        {symbol}
      </Text>
    </>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="3">
      <Text fontWeight="800">{label}</Text>
      {children}
    </Stack>
  );
}

function GeneratingScreen() {
  const steps = ["Frame", "GIF", "QR", "Share"];

  return (
    <PageShell>
      <Flex minH="70dvh" align="center" justify="center">
        <Stack
          bg="booth.surface"
          rounded="booth"
          borderWidth="1px"
          borderColor="booth.border"
          shadow="booth"
          p={{ base: "6", md: "8" }}
          gap="7"
          w="min(100%, 560px)"
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            insetX="12"
            top="7"
            h="2"
            rounded="full"
            bg="booth.surfaceTint"
            overflow="hidden"
          >
            <Box
              h="full"
              rounded="full"
              bg="booth.primary"
              animation="booth-fill 2.6s ease-in-out infinite"
              transformOrigin="left center"
              _motionReduce={{ animation: "none", transform: "scaleX(1)" }}
            />
          </Box>

          <Box position="relative" mx="auto" mt="7" w="180px" h="150px">
            <Box
              position="absolute"
              inset="4"
              bg="booth.secondary"
              rounded="booth"
              transform="rotate(-4deg)"
              animation="booth-drift 2.8s ease-in-out infinite"
              _motionReduce={{ animation: "none" }}
            />
            <Box
              position="absolute"
              inset="0"
              bg="booth.surfaceTint"
              rounded="booth"
              borderWidth="2px"
              borderColor="booth.fg"
              overflow="hidden"
              shadow="button"
            >
              <Box
                position="absolute"
                insetX="5"
                top="5"
                h="78px"
                rounded="control"
                bg="white"
              />
              <Box
                position="absolute"
                insetY="0"
                w="44%"
                bg="rgba(255,255,255,0.55)"
                animation="booth-scan 1.35s ease-in-out infinite"
                _motionReduce={{ animation: "none", opacity: "0" }}
              />
              <HStack
                position="absolute"
                left="5"
                right="5"
                bottom="4"
                justify="space-between"
              >
                {[0, 1, 2].map((index) => (
                  <Box
                    key={index}
                    h="3"
                    flex="1"
                    rounded="full"
                    bg={index === 1 ? "booth.primary" : "booth.yellow"}
                    animation={`booth-tick 1.4s ease-in-out ${index * 0.18}s infinite`}
                    _motionReduce={{ animation: "none", opacity: "1" }}
                  />
                ))}
              </HStack>
            </Box>

            <Circle
              position="absolute"
              right="-3"
              top="-3"
              size="14"
              bg="booth.yellow"
              color="booth.fg"
              animation="pulse 1.4s ease-in-out infinite"
              _motionReduce={{ animation: "none" }}
            >
              <Icon as={LuSparkles} boxSize="7" aria-hidden="true" />
            </Circle>
          </Box>

          <Stack gap="2">
            <Heading size="2xl" lineHeight="1">
              Building your booth moment
            </Heading>
            <Text color="booth.muted">
              Polishing the frame, GIF, QR code, and private link.
            </Text>
          </Stack>

          <SimpleGrid columns={4} gap="2">
            {steps.map((step, index) => (
              <Stack
                key={step}
                gap="2"
                align="center"
                animation={`booth-tick 1.6s ease-in-out ${index * 0.2}s infinite`}
                _motionReduce={{ animation: "none", opacity: "1" }}
              >
                <Circle
                  size="9"
                  bg={index % 2 === 0 ? "booth.secondary" : "booth.surfaceTint"}
                  color="booth.fg"
                  borderWidth="1px"
                  borderColor="booth.border"
                >
                  {index === 2 ? (
                    <Icon as={LuQrCode} boxSize="4" aria-hidden="true" />
                  ) : index === 1 ? (
                    <Text fontSize="xs" fontWeight="950">
                      GIF
                    </Text>
                  ) : (
                    <Icon as={LuSparkles} boxSize="4" aria-hidden="true" />
                  )}
                </Circle>
                <Text color="booth.muted" fontSize="xs" fontWeight="800">
                  {step}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      </Flex>
    </PageShell>
  );
}

function ShareScreen() {
  const shareResult = useBoothStore((state) => state.shareResult);
  const generatedDataUrl = useBoothStore((state) => state.generatedDataUrl);
  const reset = useBoothStore((state) => state.reset);
  const setEmailStatus = useBoothStore((state) => state.setEmailStatus);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(reset, boothConfig.resetAfterMs);
    return () => window.clearTimeout(timeout);
  }, [reset]);

  if (!shareResult) return null;

  const previewAssetUrl =
    generatedDataUrl ?? shareResult.gifAssetUrl ?? shareResult.finalAssetUrl;

  async function sendEmail() {
    if (!shareResult) return;
    setEmailError(null);
    setEmailStatus("sending");
    const response = await fetch(`/api/sessions/${shareResult.token}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      setEmailStatus("failed");
      setEmailError(
        "That email could not be sent. Check the address and try again.",
      );
      return;
    }

    setEmailStatus("sent");
  }

  return (
    <PageShell>
      <Grid
        gap="6"
        templateColumns={{ base: "1fr", lg: "1fr 420px" }}
        alignItems="stretch"
      >
        <Box
          bg="booth.surface"
          rounded="booth"
          p="4"
          borderWidth="1px"
          borderColor="booth.border"
          shadow="booth"
        >
          <Image
            src={previewAssetUrl}
            alt="Final booth output"
            htmlWidth="1400"
            htmlHeight="1400"
            rounded="control"
            w="100%"
            maxH="78dvh"
            objectFit="contain"
          />
        </Box>

        <Stack
          bg="booth.surface"
          rounded="booth"
          borderWidth="1px"
          borderColor="booth.border"
          p="6"
          gap="6"
        >
          <Stack gap="2">
            <Heading size="3xl">Ready to grab.</Heading>
            <Text color="booth.muted">
              Scan the QR code or send the private link to an email.
            </Text>
          </Stack>

          <Box
            bg="white"
            p="5"
            rounded="control"
            borderWidth="1px"
            borderColor="booth.border"
          >
            <QRCode
              value={shareResult.shareUrl}
              style={{ width: "100%", height: "auto" }}
            />
          </Box>

          {/* <Stack gap="3">
            <Field.Root invalid={Boolean(emailError)}>
              <Field.Label>Email backup link</Field.Label>
              <Input
                type="email"
                value={email}
                name="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="guest@example.com…"
                rounded="full"
              />
              {emailError && (
                <Field.ErrorText aria-live="polite">
                  {emailError}
                </Field.ErrorText>
              )}
            </Field.Root>
            <Button
              rounded="full"
              variant="outline"
              onClick={sendEmail}
              disabled={!email}
            >
              <LuMail />
              {shareResult.emailStatus === "sending"
                ? "Sending…"
                : "Send email"}
            </Button>
            {shareResult.emailStatus === "sent" && (
              <Text color="green.700" fontWeight="800" aria-live="polite">
                Email sent.
              </Text>
            )}
          </Stack> */}

          <Button
            size="xl"
            rounded="full"
            bg="booth.primary"
            color="white"
            onClick={reset}
          >
            Start new session
          </Button>
        </Stack>
      </Grid>
    </PageShell>
  );
}

function ErrorScreen() {
  const errorMessage = useBoothStore((state) => state.errorMessage);
  const reset = useBoothStore((state) => state.reset);
  const setStep = useBoothStore((state) => state.setStep);

  return (
    <PageShell>
      <Flex minH="70dvh" align="center" justify="center">
        <Stack
          bg="booth.surface"
          rounded="booth"
          borderWidth="1px"
          borderColor="booth.border"
          p="8"
          gap="5"
          maxW="34rem"
          textAlign="center"
          shadow="booth"
        >
          <Circle size="20" bg="booth.yellow" mx="auto">
            <Icon as={LuCamera} boxSize="9" />
          </Circle>
          <Heading>Camera needs a quick check.</Heading>
          <Text color="booth.muted">{errorMessage}</Text>
          <HStack justify="center">
            <Button rounded="full" variant="outline" onClick={reset}>
              Start over
            </Button>
            <Button
              rounded="full"
              bg="booth.primary"
              color="white"
              onClick={() => setStep("camera")}
            >
              Try again
            </Button>
          </HStack>
        </Stack>
      </Flex>
    </PageShell>
  );
}
