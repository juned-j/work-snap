import React from 'react'

type State = { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: any) {
    // Safe log for debugging; avoid leaking sensitive data
    try {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary] Caught error:', { message: error?.message, info })
    } catch (e) {}
    this.setState({ error })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
          <div className="max-w-lg p-8 bg-white rounded shadow">
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-600 mb-4">An unexpected error occurred. The app is still running.</p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children as any
  }
}

export default ErrorBoundary
