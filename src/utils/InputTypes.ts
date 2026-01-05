import { BsInputCursor, BsFillImageFill } from 'react-icons/bs';
import { TbSortAscendingNumbers } from 'react-icons/tb';
import { BiRadioCircleMarked } from 'react-icons/bi';
import { MdGpsFixed } from 'react-icons/md';
import type { IconType } from 'react-icons';

export interface InputTypeConfig {
  name: string;
  Icon: IconType;
}

export const INPUT_TYPES: Record<string, InputTypeConfig> = {
  text: {
    name: 'Text',
    Icon: BsInputCursor,
  },
  number: {
    name: 'Number',
    Icon: TbSortAscendingNumbers,
  },
  image: {
    name: 'Image',
    Icon: BsFillImageFill,
  },
  gps: {
    name: 'GPS',
    Icon: MdGpsFixed,
  },
  radio: {
    name: 'Radio',
    Icon: BiRadioCircleMarked,
  },
  checkbox: {
    name: 'Checkbox',
    Icon: BiRadioCircleMarked,
  },
};

export default INPUT_TYPES;

