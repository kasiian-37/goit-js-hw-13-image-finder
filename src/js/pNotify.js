import { alert, Stack } from '@pnotify/core';

const stackForNotify = new Stack({
  dir1: 'down',
  firstpos1: 40,
  firstpos2: 40,
  spacing1: 0,
  push: 'bottom',
  maxOpen: 1,
  modal: false,
  positioned: true,
  context: document.body,
});

export function onNotify(
  text = 'Something went wrong',
  type = 'error',
  title = '',
  delay = 1000,
) {
  const options = {
    title,
    text,
    type,
    stack: stackForNotify,
    delay,
    styling: 'brighttheme',
    
  };
  alert(options);
}
