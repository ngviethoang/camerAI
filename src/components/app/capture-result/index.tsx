import { Sheet, SheetContent } from '@/components/ui/sheet';
import useAppStore from '@/store';
import { LazyExoticComponent, lazy, useEffect, useState } from 'react';

export default function CaptureResult() {
  const { mode, isCapturedWindowOpen, setIsCapturedWindowOpen } = useAppStore();
  const [MainComponent, setMainComponent] =
    useState<LazyExoticComponent<any>>();

  useEffect(() => {
    setMainComponent(lazy(() => import(`../services/${mode}`)));
  }, [mode]);

  return (
    <Sheet open={isCapturedWindowOpen} onOpenChange={setIsCapturedWindowOpen}>
      <SheetContent className="w-full h-full p-4">
        {!!MainComponent && <MainComponent />}
      </SheetContent>
    </Sheet>
  );
}
