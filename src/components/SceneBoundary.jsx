import { Component } from 'react'

/** Shows `fallback` if the WebGL scene throws (e.g. context creation fails). */
export default class SceneBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('[La Cakería] 3D scene disabled:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
