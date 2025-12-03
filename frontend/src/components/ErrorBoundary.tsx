import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl p-6 mx-auto mt-10 text-sm bg-white/5 border border-white/10 rounded-lg">
          <div className="mb-2 text-lg font-semibold">Ocurrió un error en la aplicación</div>
          <div className="mb-4 text-gray-300">Podés intentar recargar la vista. Si persiste, por favor avisanos.</div>
          <div className="flex items-center gap-3">
            <button onClick={this.handleRetry} className="px-3 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500">Reintentar</button>
            <button onClick={() => window.location.reload()} className="px-3 py-2 text-white bg-white/10 border border-white/20 rounded hover:bg-white/20">Recargar</button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}
