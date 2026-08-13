export interface MenuState {
	open: boolean; // overlay open; closed menus never react to keys
	activeIndex: number; // keyboard-active item; -1 means none
}

export type MenuKeyResult =
	| { kind: "move"; activeIndex: number }
	| { kind: "activate" }
	| { kind: "none" };

// Closed menus and unsupported keys no-op so page keys are never hijacked.
export function reduceMenuKey(
	state: MenuState,
	key: string,
	itemCount: number,
): MenuKeyResult {
	if (!state.open || itemCount <= 0) return { kind: "none" };
	switch (key) {
		case "ArrowDown": {
			const activeIndex =
				state.activeIndex >= itemCount - 1 ? 0 : state.activeIndex + 1;
			return { kind: "move", activeIndex };
		}
		case "ArrowUp": {
			const activeIndex =
				state.activeIndex <= 0 ? itemCount - 1 : state.activeIndex - 1;
			return { kind: "move", activeIndex };
		}
		case "Enter":
			return { kind: "activate" };
		default:
			return { kind: "none" };
	}
}

export interface OverlayOptions {
	itemDuration: number; // per-item entrance ms
	stagger: number; // between-item delay ms (design 30-50ms band)
	reduced: boolean; // opacity-only (reduced motion)
}

export type ListKeyResult =
	| { kind: "move"; activeIndex: number }
	| { kind: "open" }
	| { kind: "none" };

// View LIST keys (persona-navigation): ArrowUp/Down move with wrap, Enter or
// ArrowRight open the detail panel; unsupported keys and empty lists no-op.
export function reduceListKey(
	state: { activeIndex: number },
	key: string,
	length: number,
): ListKeyResult {
	if (length <= 0) return { kind: "none" };
	switch (key) {
		case "ArrowDown": {
			const activeIndex =
				state.activeIndex >= length - 1 ? 0 : state.activeIndex + 1;
			return { kind: "move", activeIndex };
		}
		case "ArrowUp": {
			const activeIndex =
				state.activeIndex <= 0 ? length - 1 : state.activeIndex - 1;
			return { kind: "move", activeIndex };
		}
		case "Enter":
		case "ArrowRight":
			return { kind: "open" };
		default:
			return { kind: "none" };
	}
}

// Escape hierarchy (persona-navigation): close an open panel first; with no
// panel open, the view returns to the menu route.
export function escapeHierarchy(panelOpen: boolean): "close-panel" | "to-menu" {
	return panelOpen ? "close-panel" : "to-menu";
}

// Items 300ms ease-out with 25ms stagger: the five-item shell overlay moment
// (300 + 4x25 = 400ms) lands exactly on the design's 400ms exception.
export function menuOverlayOptions(reducedMotion: boolean): OverlayOptions {
	if (reducedMotion) {
		return { itemDuration: 200, stagger: 0, reduced: true };
	}
	return { itemDuration: 300, stagger: 25, reduced: false };
}
