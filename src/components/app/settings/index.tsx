import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import useAppStore from '@/store';
import { MenuIcon } from 'lucide-react';

const CREDENTIALS_KEYS = [
  {
    key: 'openaiKey',
    label: 'OpenAI Key',
  },
  {
    key: 'replicateKey',
    label: 'Replicate Key',
  },
];

export function Settings() {
  const { credentials, setCredentials } = useAppStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={'ghost'} size={'icon'}>
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Save your API Keys here. They will be stored in your browser.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {CREDENTIALS_KEYS.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={key} className="text-right">
                {label}
              </Label>
              <Input
                id={key}
                value={credentials[key]}
                onChange={(e) => setCredentials(key, e.target.value)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
