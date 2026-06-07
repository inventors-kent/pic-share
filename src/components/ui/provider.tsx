"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { boothSystem } from "@/theme";

export function Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ChakraProvider value={boothSystem}>{children}</ChakraProvider>;
}
