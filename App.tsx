
import React, { useState, useCallback, useRef } from 'react';
import { ART_STYLES } from './constants';
import { TransformationState } from './types';
import { geminiService } from './services/gemini';
import MushroomLogo from './components/MushroomLogo';

const App: React.FC = () => {
  const [state, setState] = useState<TransformationState>({
    originalImage: null,
    resultImage: null,
    selectedStyleId: ART_STYLES[0].id,
    isProcessing: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({
          ...prev,
          originalImage: event.target?.result as string,
          resultImage: null,
          error: null
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!state.originalImage) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    const style = ART_STYLES.find(s => s.id === state.selectedStyleId);
    if (!style) return;

    try {
      const transformedImageUrl = await geminiService.transformImage(state.originalImage, style.prompt);
      setState(prev => ({
        ...prev,
        resultImage: transformedImageUrl,
        isProcessing: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: "生成失败，请稍后重试。"
      }));
    }
  };

  const handleDownload = () => {
    if (!state.resultImage) return;
    const link = document.createElement('a');
    link.href = state.resultImage;
    link.download = `transformed-art-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setState({
      originalImage: null,
      resultImage: null,
      selectedStyleId: ART_STYLES[0].id,
      isProcessing: false,
      error: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MushroomLogo className="w-8 h-8" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
              设计风格迁移
            </h1>
          </div>
          <button 
            onClick={reset}
            className="text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            重置应用
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input and Preview */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-3xl p-6 shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-gray-200">
              {!state.originalImage ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">上传原始图片</h3>
                  <p className="text-gray-500 mt-2 mb-6">支持 JPG, PNG, WEBP 格式</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >
                    选择图片
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">原始图片</p>
                      <div className="rounded-2xl overflow-hidden shadow-inner bg-gray-100 aspect-square">
                        <img src={state.originalImage} alt="Original" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">艺术效果</p>
                      <div className="rounded-2xl overflow-hidden shadow-inner bg-gray-100 aspect-square relative flex items-center justify-center">
                        {state.isProcessing ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-10">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-blue-600 font-medium animate-pulse">AI正在创作中...</p>
                          </div>
                        ) : state.resultImage ? (
                          <img src={state.resultImage} alt="Result" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
                        ) : (
                          <div className="text-gray-400 text-sm text-center px-6">
                            选择下方风格并点击一键转换
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {state.error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      <span>{state.error}</span>
                    </div>
                  )}

                  <div className="flex space-x-4 mt-8">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                      更换图片
                    </button>
                    {state.resultImage && (
                      <button 
                        onClick={handleDownload}
                        className="px-6 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span>保存到本地</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Style Selector */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
                选择艺术风格
              </h2>
              <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {ART_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setState(prev => ({ ...prev, selectedStyleId: style.id }))}
                    className={`relative p-3 rounded-2xl border-2 text-left transition-all ${
                      state.selectedStyleId === style.id 
                      ? 'border-red-500 bg-red-50 ring-4 ring-red-100' 
                      : 'border-gray-50 bg-gray-50 hover:border-gray-200 hover:bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className="font-bold text-sm text-gray-900">{style.name}</div>
                    <div className="text-[10px] text-gray-500 line-clamp-1">{style.description}</div>
                    {state.selectedStyleId === style.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={handleTransform}
                  disabled={!state.originalImage || state.isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 shadow-xl shadow-red-200 transition-all active:scale-95 ${
                    !state.originalImage || state.isProcessing
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-red-600 to-orange-500 text-white hover:opacity-90'
                  }`}
                >
                  {state.isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>正在迁移风格...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <span>一键转为艺术画</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <p className="text-xs text-orange-700 leading-relaxed">
                <strong>💡 提示：</strong> 选中的风格会通过 Gemini 2.5 Flash Image 强大的多模态能力进行重绘。建议上传主体明确、背景简洁的图片以获得最佳效果。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>© 2024 设计风格迁移 - AI 艺术工坊</p>
      </footer>
    </div>
  );
};

export default App;
