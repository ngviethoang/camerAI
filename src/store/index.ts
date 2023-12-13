import { APP_MODES } from '@/const'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface CredentialsProps {
  openaiKey: string;
  replicateKey: string;
  [key: string]: any;
}

interface AppState {
  cameraMode: 'photo' | 'video'
  setCameraMode: (value: 'photo' | 'video') => void
  isCapturedWindowOpen: boolean
  setIsCapturedWindowOpen: (value: boolean) => void
  mode: string
  setMode: (value: string) => void
  webcamImageSrc?: string | null
  setWebcamImageSrc: (value?: string | null) => void
  webcamVideo?: any
  setWebcamVideo: (value: any) => void
  credentials: CredentialsProps
  setCredentials: (key: string, value: any) => void
  gpt4vMessages: any[]
  setGpt4vMessages: (value: any[]) => void
}

const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set: any, get) => ({
        cameraMode: 'photo',
        setCameraMode: (value) => set({ cameraMode: value }),
        isCapturedWindowOpen: false,
        setIsCapturedWindowOpen: (value) => set({ isCapturedWindowOpen: value }),

        mode: APP_MODES[1].value,
        setMode: (value) => set({
          mode: value,
          webcamImageSrc: null,
          cameraMode: APP_MODES.find((mode) => mode.value === value)?.cameraMode || get().cameraMode,
        }),

        setWebcamImageSrc: (value) => set({ webcamImageSrc: value }),
        setWebcamVideo: (value) => set({ webcamVideo: value }),

        credentials: {
          openaiKey: '',
          replicateKey: '',
        },
        setCredentials: (key, value) => set((state: any) => ({
          credentials: {
            ...state.credentials,
            [key]: value,
          },
        })),

        gpt4vMessages: [],
        setGpt4vMessages: (value) => set({ gpt4vMessages: value }),
      }),
      { name: 'appStore' },
    ),
  ),
)

export default useAppStore
