export interface ModuleDurationsMap {
  [index: string]: Number;
}

export interface ModuleDuration {
  module: string;
  duration: number;
}

export interface TEF {
  name: string;
  cat: string;
  ph: string;
  pid: number;
  ts: number;
  dur: number;
}

export declare function getModuleDurations(): ModuleDurationsMap;
export declare function sortModuleDurations(moduleDurations: ModuleDurationsMap): ModuleDuration[];
export declare function convertModuleDurationstoTEF(moduleDurations: ModuleDuration[]): TEF[];
