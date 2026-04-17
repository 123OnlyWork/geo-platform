type Listener = (val: any) => void

const state: { selected: any; listeners: Listener[] } = {
  selected: null,
  listeners: [],
}

export function setSelected(v: any) {
  state.selected = v
  state.listeners.forEach((l) => l(v))
}

export function subscribe(fn: Listener) {
  state.listeners.push(fn)
  return () => {
    state.listeners = state.listeners.filter((x) => x !== fn)
  }
}

export function getSelected() {
  return state.selected
}
