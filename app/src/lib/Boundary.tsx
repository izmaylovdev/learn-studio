import { Component, type ReactNode } from 'react';
import { L } from './i18n';

/**
 * An embedded figure that throws must not take the whole material down with it.
 * React unmounts the entire tree on an uncaught render error, so without this a
 * single bad formula spec leaves the reader staring at a blank page.
 */
export class Boundary extends Component<
  { label: string; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[learn-studio] ${this.props.label} failed to render`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="viz viz-error">
          <b>{this.props.label} <L en="failed to render." uk="— не вдалося відобразити." /></b>
          <p>{this.state.error.message}</p>
          <p>
            <L en="The rest of this material is unaffected. Details are in the browser console."
               uk="Решта матеріалу працює. Подробиці — у консолі браузера." />
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
