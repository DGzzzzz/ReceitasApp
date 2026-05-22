import {createIconSet} from 'react-native-vector-icons';

const glyphMap: Record<string, number> = {
  'camera':           0xf348,
  'camera-viewfinder':0xf347,
  'clock':            0xf45c,
  'utensils':         0xfeaa,
  'plate-utensils':   0xfa9c,
  'fork':             0xf6c9,
  'plus':             0xfab1,
  'add':              0xf11a,
  'pencil':           0xfa2f,
  'trash':            0xfe19,
  'exclamation':      0xf5ee,
  'triangle-warning': 0xfe35,
  'check':            0xf3c9,
  'check-circle':     0xf3c5,
  'info':             0xf813,
  'hat-chef':         0xf786,
  'restaurant':       0xfb50,
  'home':             0xf7c0,
  'user':             0xfea2,
  'users':            0xfea8,
  'picture':          0xfa7e,
  'angle-left':       0xf151,
  'angle-right':      0xf152,
  'bowl-spoon':       0xf2a7,
  'salad':            0xfb8e,
  'lock':             0xf8dd,
  'globe':            0xf70b,
  'search':           0xfbc0,
  'copy':             0xf4df,
};

export type IconName = keyof typeof glyphMap;

export const Icon = createIconSet(
  glyphMap,
  'uicons-bold-rounded',
  'uicons-bold-rounded.ttf',
);
