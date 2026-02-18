/**
 * Граница ошибок: при ошибке в дочернем дереве показывает ErrorFallback вместо краша.
 * Классовый компонент нужен из-за getDerivedStateFromError (в функциональном API нет аналога).
 * onReset сбрасывает состояние и даёт пользователю попробовать снова без перезагрузки.
 */
import type { ReactNode } from "react";
import { Component } from "react";
import { ErrorFallback } from "../../shared/ui/ErrorFallback";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error ?? undefined}
          onReset={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
