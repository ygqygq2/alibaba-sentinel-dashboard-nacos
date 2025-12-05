'use client';

import { Drawer as ChakraDrawer, Portal } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface DrawerContentProps extends ChakraDrawer.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(props, ref) {
  const { children, portalled = true, portalRef, ...rest } = props;

  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <ChakraDrawer.Positioner>
        <ChakraDrawer.Content
          ref={ref}
          {...rest}
          asChild={false}
        >
          {children}
        </ChakraDrawer.Content>
      </ChakraDrawer.Positioner>
    </Portal>
  );
});

export const DrawerCloseTrigger = forwardRef<HTMLButtonElement, ChakraDrawer.CloseTriggerProps>(
  function DrawerCloseTrigger(props, ref) {
    return (
      <ChakraDrawer.CloseTrigger
        {...props}
        asChild={false}
        ref={ref}
      />
    );
  }
);

export const DrawerTrigger = forwardRef<HTMLButtonElement, ChakraDrawer.TriggerProps>(
  function DrawerTrigger(props, ref) {
    return (
      <ChakraDrawer.Trigger
        {...props}
        asChild={false}
        ref={ref}
      />
    );
  }
);

export const DrawerRoot = ChakraDrawer.Root;
export const DrawerBackdrop = ChakraDrawer.Backdrop;
export const DrawerBody = ChakraDrawer.Body;
export const DrawerFooter = ChakraDrawer.Footer;
export const DrawerHeader = ChakraDrawer.Header;
export const DrawerTitle = ChakraDrawer.Title;
export const DrawerDescription = ChakraDrawer.Description;

export const Drawer = {
  Root: DrawerRoot,
  Backdrop: DrawerBackdrop,
  Body: DrawerBody,
  CloseTrigger: DrawerCloseTrigger,
  Content: DrawerContent,
  Footer: DrawerFooter,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Trigger: DrawerTrigger,
};
