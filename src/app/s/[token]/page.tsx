import {
  Box,
  Button,
  Container,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ShareDownload } from "@/components/share/share-download";
import { env } from "@/lib/env";
import {
  getPhotoSessionByToken,
  isSessionExpired,
} from "@/server/session-repository";

type SharePageProps = {
  params: Promise<{ token: string }>;
};

function createDevMockSession(token: string) {
  if (process.env.NODE_ENV === "production" || !token.startsWith("mock")) {
    return null;
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const finalAssetUrl =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
        <rect width="1200" height="1200" fill="#fff8ed"/>
        <rect x="90" y="90" width="1020" height="1020" rx="70" fill="#ff6b5f"/>
        <rect x="150" y="150" width="420" height="420" rx="40" fill="#8ee6c8"/>
        <rect x="630" y="150" width="420" height="420" rx="40" fill="#ffd66b"/>
        <rect x="150" y="630" width="420" height="420" rx="40" fill="#b9a8ff"/>
        <rect x="630" y="630" width="420" height="420" rx="40" fill="#8fd4ff"/>
        <text x="600" y="1120" text-anchor="middle" font-family="Arial" font-size="48" font-weight="700" fill="#182026">PicShare Booth</text>
      </svg>
    `);

  return {
    token,
    expiresAt,
    finalAssetUrl,
    gifAssetUrl: null,
    sourcePhotoAssets: [],
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const session = await getPhotoSessionByToken(token);
  const devMock = createDevMockSession(token);

  if ((!session || isSessionExpired(session)) && !devMock) {
    return (
      <Box bg="booth.bg" minH="100dvh">
        <Container maxW="lg" py="20">
          <Stack
            bg="booth.surface"
            rounded="booth"
            borderWidth="1px"
            borderColor="booth.border"
            p="8"
            gap="5"
            textAlign="center"
            shadow="booth"
          >
            <Heading>This link has left the booth.</Heading>
            <Text color="booth.muted">
              The private download link is expired or could not be found.
            </Text>
            <Button asChild bg="booth.primary" color="white" rounded="full">
              <Link href={env.APP_BASE_URL}>Back to booth</Link>
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (session) {
    return (
      <ShareDownload
        token={session.token}
        expiresAt={session.expiresAt}
        finalAssetUrl={session.finalAssetUrl}
        gifAssetUrl={session.gifAssetUrl}
        sourcePhotoAssets={session.sourcePhotoAssets}
      />
    );
  }

  if (!devMock) {
    throw new Error("Share session could not be resolved.");
  }

  return <ShareDownload {...devMock} />;
}
