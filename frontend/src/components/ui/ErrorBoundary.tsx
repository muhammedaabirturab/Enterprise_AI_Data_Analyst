import { AlertTriangle } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render errors in a subtree so one broken section (e.g. a chart fed
 * unexpected data) can never take down the entire Workspace page. React
 * error boundaries must be class components — there is no hook equivalent.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in ${this.props.label ?? "a component"}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-8 flex flex-col items-center text-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center text-danger-500">
            <AlertTriangle size={20} />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {this.props.label ? `${this.props.label} couldn't be displayed` : "This section couldn't be displayed"}
          </p>
          <p className="text-xs text-slate-400 max-w-xs">
            Something went wrong rendering this content. The rest of the workspace is unaffected — try a different
            selection or refresh the page.
          </p>
          <button onClick={() => this.setState({ hasError: false })} className="btn-secondary text-xs mt-1">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
