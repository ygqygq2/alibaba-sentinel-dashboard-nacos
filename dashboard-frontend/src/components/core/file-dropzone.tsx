import { Box, Stack, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import type { DropzoneOptions, FileWithPath } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

export type File = FileWithPath;

export interface FileDropzoneProps extends DropzoneOptions {
  caption?: string;
  files?: File[];
  onRemove?: (file: File) => void;
  onRemoveAll?: () => void;
  onUpload?: () => void;
}

export function FileDropzone({ caption, ...props }: FileDropzoneProps): React.JSX.Element {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(props);

  return (
    <Stack gap={2}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        p={6}
        border="1px dashed"
        borderRadius="md"
        cursor="pointer"
        outline="none"
        bg={isDragActive ? 'gray.200' : 'white'}
        opacity={isDragActive ? 0.5 : 1}
        _hover={{ bg: !isDragActive ? 'gray.100' : 'gray.200' }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Stack
          direction="row"
          gap={2}
          alignItems="center"
        >
          <Box
            boxSize="64px"
            bg="white"
            color="gray.800"
            boxShadow="md"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              icon="ph:cloud-arrow-up"
              style={{ fontSize: '2rem' }}
            />
          </Box>
          <Stack gap={1}>
            <Text fontSize="lg">
              <Text
                as="span"
                textDecoration="underline"
              >
                Click to upload
              </Text>{' '}
              or drag and drop
            </Text>
            {caption ? (
              <Text
                color="gray.500"
                fontSize="sm"
              >
                {caption}
              </Text>
            ) : null}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
