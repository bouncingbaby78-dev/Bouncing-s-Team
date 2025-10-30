
export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  psnr: number;
  mse: number;
}

export type AppStatus = 'idle' | 'image-loaded' | 'compressing' | 'done';
