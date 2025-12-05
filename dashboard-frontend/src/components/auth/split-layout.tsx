import { Box, Image, Stack, Text } from '@chakra-ui/react';
import * as React from 'react';

import { useColorMode } from '@/hooks/use-color-mode';

export interface SplitLayoutProps {
  children: React.ReactNode;
}

export function SplitLayout({ children }: SplitLayoutProps): React.JSX.Element {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      display={{ base: 'block', lg: 'grid' }}
      gridTemplateColumns={{ lg: '1fr 800px' }}
      minHeight="100vh"
    >
      <Box
        alignItems="center"
        justifyContent="center"
        bgGradient={isDark ? 'linear(to-br, gray.800, gray.900)' : 'linear(to-br, blue.500, blue.700)'}
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        p={8}
        position="relative"
        overflow="hidden"
      >
        {/* 背景装饰 */}
        <Box
          position="absolute"
          top="-10%"
          right="-10%"
          width="50%"
          height="50%"
          borderRadius="full"
          bg="whiteAlpha.100"
          filter="blur(60px)"
        />
        <Box
          position="absolute"
          bottom="-10%"
          left="-10%"
          width="40%"
          height="40%"
          borderRadius="full"
          bg="whiteAlpha.100"
          filter="blur(60px)"
        />

        <Stack
          gap={8}
          maxWidth="500px"
          alignItems="center"
          textAlign="center"
          zIndex={1}
        >
          {/* Logo - 始终白色背景让黑字可见 */}
          <Box
            bg="white"
            borderRadius="xl"
            px={6}
            py={4}
            boxShadow="lg"
          >
            <Image
              src="/assets/sentinel-logo.png"
              alt="Sentinel Logo"
              width="180px"
              height="auto"
              objectFit="contain"
            />
          </Box>

          <Stack gap={3}>
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color={isDark ? 'white' : 'gray.800'}
            >
              Sentinel Dashboard
            </Text>
            <Text
              fontSize="lg"
              color={isDark ? 'whiteAlpha.800' : 'gray.600'}
            >
              流量控制 · 熔断降级 · 系统保护
            </Text>
          </Stack>
        </Stack>
      </Box>
      <Box
        boxShadow="lg"
        display="flex"
        flexDirection="column"
      >
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          flex="1 1 auto"
          justifyContent="center"
          p={3}
        >
          <Box
            maxWidth="420px"
            width="100%"
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
