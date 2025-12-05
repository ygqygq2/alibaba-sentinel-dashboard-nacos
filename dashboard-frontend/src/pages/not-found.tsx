import { Box, Button, Container, Heading, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { RouterLink } from '@/components/core/link';
import { useSettings } from '@/hooks/use-settings';
import { paths } from '@/paths';

import { config } from '../config';
import type { Metadata } from '../types/metadata';

const metadata = { title: `Not found | ${config.site.name}` } satisfies Metadata;

export function Page(): React.JSX.Element {
  const { settings } = useSettings();

  return (
    <React.Fragment>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Container
          maxW="4xl"
          textAlign="center"
        >
          <Stack
            gap={8}
            alignItems="center"
          >
            {/* 404 图标 */}
            <Box>
              <img
                src="/assets/not-found.svg"
                alt="Not found"
                style={{ width: 'auto', height: '260px', display: 'inline-block' }}
              />
            </Box>

            {/* 内容区域 */}
            <Stack
              gap={2}
              alignItems="center"
            >
              {/* 标题 */}
              <Heading
                as="h3"
                fontSize="32px"
                color={{ base: 'gray.900', _dark: 'white' }}
              >
                404: The page you are looking for isn't here
              </Heading>

              {/* 描述文字 */}
              <Text
                fontSize="md"
                color={{ base: 'gray.600', _dark: 'gray.400' }}
                lineHeight="1.6"
              >
                You either tried some shady route or you came here by mistake. Whichever it is, try using the
                navigation.
              </Text>
            </Stack>

            {/* 返回按钮 */}
            <Box>
              <Button
                asChild
                variant="solid"
                colorPalette={settings.primaryColor}
                size="md"
              >
                <ChakraLink
                  as={RouterLink}
                  href={paths.home}
                  textDecoration="none"
                  _hover={{ textDecoration: 'none' }}
                >
                  Back to home
                </ChakraLink>
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>
    </React.Fragment>
  );
}
