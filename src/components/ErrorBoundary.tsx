import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-950 text-white p-10">
          <div className="max-w-2xl bg-black/60 p-8 rounded-2xl border border-red-500/50 shadow-2xl">
            <h1 className="text-3xl font-bold mb-4 text-red-400">¡Error en la aplicación!</h1>
            <p className="mb-4 text-white/80">La aplicación colapsó debido al siguiente error. Por favor, toma una captura de pantalla de esto:</p>
            <pre className="bg-black p-4 rounded-lg text-sm overflow-auto text-red-300 font-mono border border-red-900/50">
              {this.state.error?.toString() || 'Error desconocido'}
            </pre>
            <p className="mt-4 text-xs text-white/50">Revisa también la consola de desarrollo (F12) para más detalles.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
