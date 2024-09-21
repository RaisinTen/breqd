import { expectType } from 'tsd';
import {
  ModuleDurationsMap,
  ModuleDuration,
  TEF,
  getModuleDurations,
  sortModuleDurations,
  convertModuleDurationstoTEF,
} from '.';

const moduleDurations: ModuleDurationsMap = getModuleDurations();
expectType<{
  [index: string]: Number;
}>(moduleDurations);

const sortedModuleDurations: ModuleDuration[] =
  sortModuleDurations(moduleDurations);
expectType<{
  moduleName: string;
  duration: number;
}[]>(sortedModuleDurations);

const tef: TEF[] = convertModuleDurationstoTEF(sortedModuleDurations);
expectType<{
  name: string;
  cat: string;
  ph: string;
  pid: number;
  ts: number;
  dur: number;
}[]>(tef);
