import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createChatCompletion } from '@/lib/openai';
import useAppStore from '@/store';
import { CameraIcon, SendIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Gpt4v() {
  const {
    webcamImageSrc,
    setWebcamImageSrc,
    credentials,
    setIsCapturedWindowOpen,
    gpt4vMessages: messages,
    setGpt4vMessages: setMessages,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!webcamImageSrc) return;
    let newMessages: any[] = [];
    const newContent = {
      type: 'image_url',
      image_url: {
        url: webcamImageSrc,
      },
    };
    if (messages.length > 0) {
      const currentMessage = messages[messages.length - 1];
      if (currentMessage.role === 'user') {
        currentMessage.content.push(newContent);
        newMessages = [
          ...messages.slice(0, messages.length - 1),
          currentMessage,
        ];
      } else {
        newMessages = [...messages, { role: 'user', content: [newContent] }];
      }
    } else {
      newMessages = [...messages, { role: 'user', content: [newContent] }];
    }
    setWebcamImageSrc(null);
    setMessages(newMessages);
  }, [webcamImageSrc]);

  const getContentClassName = (role: string) => {
    const commonCn = 'rounded-lg p-2 text-white text-sm';
    if (role === 'user') {
      return `${commonCn} bg-blue-400`;
    }
    return `${commonCn} bg-green-400`;
  };

  const send = async () => {
    if (!messages.length || !input) return;
    if (!credentials || !credentials.openaiKey) {
      return;
    }
    let newMessages = [];
    const newContent = {
      type: 'text',
      text: input,
    };
    const currentMessage = messages[messages.length - 1];
    if (currentMessage.role === 'user') {
      currentMessage.content.push(newContent);
      newMessages = [...messages.slice(0, messages.length - 1), currentMessage];
    } else {
      newMessages = [...messages, { role: 'user', content: [newContent] }];
    }
    setMessages(newMessages);
    setInput('');

    // send to gpt4v
    setLoading(true);
    const response = await createChatCompletion(
      credentials.openaiKey,
      'gpt-4-vision-preview',
      messages,
      1000
    );
    setLoading(false);
    if (response.status !== 200) return;
    const { choices } = response.data;
    if (!choices.length) return;
    setMessages([...newMessages, choices[0].message]);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col gap-1">
          {messages.map(({ role, content }, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1 ${
                role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {typeof content === 'string' && (
                <div className={`${getContentClassName(role)}`}>{content}</div>
              )}
              {typeof content !== 'string' &&
                content.map((contentItem: any, index: number) => (
                  <div key={index} className={`${getContentClassName(role)}`}>
                    {contentItem.type === 'image_url' &&
                      contentItem.image_url.url && (
                        <Image
                          src={contentItem.image_url.url}
                          width={window.innerWidth / 2}
                          height={window.innerHeight / 2}
                          alt=""
                        />
                      )}
                    {contentItem.type === 'text' && contentItem.text}
                  </div>
                ))}
            </div>
          ))}
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex gap-1">
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <Button size={'icon'} onClick={send}>
          <SendIcon />
        </Button>
        <Button size={'icon'} onClick={() => setIsCapturedWindowOpen(false)}>
          <CameraIcon />
        </Button>
        <Button
          size={'icon'}
          onClick={() => {
            setMessages([]);
            setInput('');
            setIsCapturedWindowOpen(false);
          }}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}
