import * as t from "./types";

export const keypressDown = (name) => (dispatch) => {
  dispatch({
    type: t.keypress_down,
    payload: name,
  });
};

export const keyPress = (code) => {
  return {
    type: t.KEYPRESS_ARROW,
    payload: code,
  };
};

export const setInfo = (name) => {
  return {
    type: t.SET_NAME,
    payload: name,
  };
};
