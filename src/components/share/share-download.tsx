"use client";

import {
  Box,
  Button,
  Container,
  Field,
  Grid,
  Heading,
  Image,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuDownload, LuMail } from "react-icons/lu";

type ShareDownloadProps = {
  token: string;
  expiresAt: string;
  finalAssetUrl: string;
  gifAssetUrl?: string | null;
  sourcePhotoAssets: Array<Record<string, unknown>>;
};

export function ShareDownload({
  token,
  expiresAt,
  finalAssetUrl,
  gifAssetUrl,
  sourcePhotoAssets,
}: ShareDownloadProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );

  async function sendEmail() {
    setStatus("sending");
    const response = await fetch(`/api/sessions/${token}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(response.ok ? "sent" : "failed");
  }

  const previewAssetUrl = gifAssetUrl ?? finalAssetUrl;
  const primaryDownloadUrl = gifAssetUrl ?? finalAssetUrl;
  const primaryDownloadLabel = gifAssetUrl ? "Download GIF" : "Download final";

  return (
    <Box bg="booth.bg" minH="100dvh">
      <Container maxW="5xl" px="4" py={{ base: "5", md: "8" }}>
        <Stack gap="6">
          <Stack gap="2" textAlign="center" align="center">
            <Heading size={{ base: "3xl", md: "5xl" }} lineHeight="1">
              Your booth moment is ready.
            </Heading>
            <Text color="booth.muted" maxW="34rem">
              Download your final image and individual photos before the private
              link expires.
            </Text>
          </Stack>

          <Box
            bg="booth.surface"
            rounded="booth"
            p={{ base: "3", md: "5" }}
            borderWidth="1px"
            borderColor="booth.border"
            shadow="booth"
          >
            <Image
              src={previewAssetUrl}
              alt="Final PicShare Booth output"
              rounded="control"
              w="100%"
              maxH="70dvh"
              objectFit="contain"
            />
          </Box>

          <Grid gap="4" templateColumns={{ base: "1fr", md: "1fr 1fr" }}>
            <Button
              asChild
              bg="booth.primary"
              color="white"
              rounded="full"
              size="xl"
            >
              <Link href={primaryDownloadUrl} download>
                <LuDownload />
                {primaryDownloadLabel}
              </Link>
            </Button>
            {gifAssetUrl && (
              <Button
                asChild
                bg="booth.fg"
                color="white"
                rounded="full"
                size="xl"
              >
                <Link href={finalAssetUrl} download>
                  <LuDownload />
                  Download still image
                </Link>
              </Button>
            )}
          </Grid>

          {sourcePhotoAssets.length > 0 && (
            <Stack gap="3">
              <Heading size="xl">Individual photos</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
                {sourcePhotoAssets.map((asset, index) => {
                  const url = typeof asset.url === "string" ? asset.url : "";
                  const publicId =
                    typeof asset.publicId === "string" ? asset.publicId : url;
                  return (
                    <Button
                      key={publicId}
                      asChild
                      variant="outline"
                      rounded="full"
                    >
                      <Link href={url} download>
                        Photo {index + 1}
                      </Link>
                    </Button>
                  );
                })}
              </SimpleGrid>
            </Stack>
          )}

          <Stack
            bg="booth.surface"
            rounded="booth"
            borderWidth="1px"
            borderColor="booth.border"
            p="5"
            gap="4"
          >
            <Field.Root>
              <Field.Label>Send this link to another email</Field.Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                rounded="full"
                placeholder="guest@example.com"
              />
            </Field.Root>
            <Button
              rounded="full"
              variant="outline"
              onClick={sendEmail}
              disabled={!email}
            >
              <LuMail />
              {status === "sending" ? "Sending" : "Send link"}
            </Button>
            {status === "sent" && <Text color="green.700">Email sent.</Text>}
            {status === "failed" && (
              <Text color="red.700">That email could not be sent.</Text>
            )}
          </Stack>

          <Text color="booth.muted" textAlign="center" fontSize="sm">
            This private link expires {new Date(expiresAt).toLocaleString()}.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
