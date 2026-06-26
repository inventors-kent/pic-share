"use client";

import { Box, Container, Link, Text } from "@chakra-ui/react";

const creatorUrl =
  "https://pixabay.com/users/irinairinafomicheva-25140203/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=13695";
const pixabayUrl =
  "https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=13695";

export function SiteFooter() {
  return (
    <Box as="footer" bg="booth.bg" color="booth.muted">
      <Container maxW="7xl" px={{ base: "4", md: "8" }} py="5">
        <Text fontSize="xs" textAlign="center">
          Sound Effect by{" "}
          <Link
            href={creatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            textDecoration="underline"
            textUnderlineOffset="2px"
            _hover={{ color: "booth.fg" }}
          >
            irinairinafomicheva
          </Link>{" "}
          from{" "}
          <Link
            href={pixabayUrl}
            target="_blank"
            rel="noopener noreferrer"
            textDecoration="underline"
            textUnderlineOffset="2px"
            _hover={{ color: "booth.fg" }}
          >
            Pixabay
          </Link>
        </Text>
      </Container>
    </Box>
  );
}
