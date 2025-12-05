'use client';

import {
  Box,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  IconButton,
  Input,
  Portal,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { useColorModeValue } from '@/hooks/use-color-mode';

function wait(time: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, time);
  });
}

interface Article {
  id: string;
  description: string;
  title: string;
  category: string;
}

const articles: Record<string, Article[]> = {
  Platform: [
    {
      id: 'ART-1',
      description:
        'Provide your users with the content they need, exactly when they need it, by building a next-level site search experience using our AI-powered search API.',
      title: 'Level up your site search experience with our hosted API',
      category: 'Users / Api-usage',
    },
    {
      id: 'ART-2',
      description:
        'Algolia is a search-as-a-service API that helps marketplaces build performant search experiences at scale while reducing engineering time.',
      title: 'Build performant marketplace search at scale',
      category: 'Users / Api-usage',
    },
  ],
  Resources: [
    {
      id: 'ART-3',
      description: "Algolia's architecture is heavily redundant, hosting every application on …",
      title: "Using NetInfo API to Improve Algolia's JavaScript Client",
      category: 'Resources / Blog posts',
    },
    {
      id: 'ART-4',
      description: 'Explore the intricacies of building high-performance applications with Algolia.',
      title: 'Build performance',
      category: 'Resources / UI libraries',
    },
  ],
};

export interface SearchDialogProps {
  onClose?: () => void;
  open?: boolean;
}

export function SearchDialog({ onClose, open = false }: SearchDialogProps): React.JSX.Element {
  const [value, setValue] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [displayArticles, setDisplayArticles] = React.useState<boolean>(false);

  const handleSubmit = React.useCallback(async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setDisplayArticles(false);
    setIsLoading(true);
    // Do search here
    await wait(1500);
    setIsLoading(false);
    setDisplayArticles(true);
  }, []);

  const overlayBg = useColorModeValue('blackAlpha.300', 'blackAlpha.500');
  const surfaceBg = useColorModeValue('white', 'gray.800');
  const hintBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const muted = useColorModeValue('gray.600', 'gray.400');

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details: { open: boolean }) => !details.open && onClose?.()}
    >
      <Portal>
        <DialogBackdrop
          bg={overlayBg}
          backdropFilter="blur(4px)"
        />
        <DialogContent
          maxW="2xl"
          w="100%"
          position="fixed"
          top="40%"
          left="50%"
          zIndex={1400}
          transform="translate(-50%, -50%)"
          boxShadow="2xl"
          borderRadius="xl"
          bg={surfaceBg}
        >
          <IconButton
            onClick={onClose}
            aria-label="Close"
            variant="ghost"
            colorPalette="gray"
            size="sm"
            position="absolute"
            top={4}
            right={4}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
          >
            <Icon
              icon="ph:x"
              width={20}
              height={20}
            />
          </IconButton>
          <DialogHeader
            px={6}
            py={5}
          >
            <Text
              fontSize="lg"
              fontWeight="semibold"
            >
              Search
            </Text>
          </DialogHeader>
          <DialogBody
            px={6}
            pb={6}
            pt={2}
            maxH="70vh"
            overflowY="auto"
          >
            <Stack gap={4}>
              <Box
                px={3}
                py={2}
                bg={hintBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
              >
                <Stack
                  direction="row"
                  gap={2}
                  align="center"
                >
                  <Icon
                    icon="ph:lightbulb"
                    width={18}
                    height={18}
                    color={useColorModeValue('gray.500', 'gray.400')}
                  />
                  <Text
                    fontSize="sm"
                    color={useColorModeValue('gray.700', 'gray.300')}
                  >
                    <Text
                      as="span"
                      fontWeight="bold"
                    >
                      Tip.
                    </Text>{' '}
                    Search by entering a keyword and pressing Enter
                  </Text>
                </Stack>
              </Box>
              <form onSubmit={handleSubmit}>
                <Box position="relative">
                  <Box
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                  >
                    <Icon
                      icon="ph:magnifying-glass"
                      width={20}
                      height={20}
                    />
                  </Box>
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={value}
                    pl={12}
                    size="lg"
                    borderRadius="md"
                    borderColor={useColorModeValue('gray.300', 'whiteAlpha.300')}
                    _hover={{ borderColor: useColorModeValue('gray.400', 'whiteAlpha.500') }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                    bg={useColorModeValue('white', 'gray.900')}
                    onChange={(event) => {
                      setValue(event.target.value);
                    }}
                  />
                </Box>
              </form>
              {isLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  py={6}
                >
                  <Spinner />
                </Box>
              ) : displayArticles ? (
                <Stack gap={4}>
                  {Object.keys(articles).map((group) => (
                    <Stack
                      key={group}
                      gap={2}
                    >
                      <Text
                        fontSize="md"
                        fontWeight="semibold"
                      >
                        {group}
                      </Text>
                      <Stack
                        borderWidth="1px"
                        borderRadius="md"
                        divideY="1px"
                        borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
                        gap={0}
                      >
                        {articles[group]?.map((article) => (
                          <Stack
                            key={article.id}
                            gap={1}
                            p={3}
                          >
                            <Box>
                              <Stack
                                direction="row"
                                gap={2}
                                align="center"
                                pl={1}
                              >
                                <Box
                                  boxSize="8px"
                                  borderRadius="full"
                                  bg="blue.500"
                                />
                                <Text fontSize="md">{article.title}</Text>
                              </Stack>
                              <Text
                                color={muted}
                                fontSize="sm"
                              >
                                {article.category}
                              </Text>
                            </Box>
                            <Text
                              color={muted}
                              fontSize="sm"
                            >
                              {article.description}
                            </Text>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </DialogBody>
        </DialogContent>
      </Portal>
    </DialogRoot>
  );
}
