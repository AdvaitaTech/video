import { Dispatch, useReducer } from "react";
import { getInitialUiState, UiActions, UiState, Widget } from "./UiState";

const UiReducer = (state: UiState, action: UiActions) => {
  switch (action.type) {
    case "widgetUpdated":
      state = { ...state, widget: action.widget };
      break;

    case "nodeSelected":
      state = {
        ...state,
        selectedNode: action.id,
        selectedChild: action.childId || null,
      };
      break;

    case "urlPreviewUpdated":
      state = { ...state, urlPreview: action.url };
      break;

    case "userUpdated":
      state = { ...state, user: action.user };
  }
  return state;
};

let _dispatch: Dispatch<UiActions> | null = null;
let _state: UiState | null = null;
export const useUiStore = () => {
  const [state, dispatch] = useReducer(UiReducer, getInitialUiState());
  _dispatch = dispatch;
  _state = state;
  return state;
};

export const getUiDispatch = () => {
  if (!_dispatch) throw new Error("Ui Dispatch not found");
  return _dispatch!;
};

export const getUiState = () => {
  if (!_state) throw new Error("Ui State not found");
  return _state!;
};
