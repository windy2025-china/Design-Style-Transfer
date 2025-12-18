
export interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
}

export interface TransformationState {
  originalImage: string | null;
  resultImage: string | null;
  selectedStyleId: string;
  isProcessing: boolean;
  error: string | null;
}
