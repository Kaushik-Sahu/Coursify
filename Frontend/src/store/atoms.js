/**
 * @fileoverview This file defines Recoil atoms for global state management in the application.
 * Atoms are pieces of state that components can subscribe to.
 */

import { atom } from "recoil";

/**
 * Recoil atom for managing the authenticated user's type.
 * It stores whether the user is a 'user', 'admin', or `null` if not authenticated.
 * Default value is retrieved from localStorage to persist login state across sessions.
 */

export const userState = atom({
  key: "userState",
  default: localStorage.getItem("type") || null,
});

/**
 * Recoil atom for managing the visibility state of the sidebar.
 * `true` if the sidebar is open, `false` if it is closed.
 */

export const sidebarState = atom({
  key: "sidebarState",
  default: false,
});

/**
 * Recoil atom for managing the dark mode state.
 * Retrieves initial value from localStorage if set, otherwise falls back to system preference.
 */
export const darkModeState = atom({
  key: "darkModeState",
  default: (() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return saved === "true";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  })(),
});

