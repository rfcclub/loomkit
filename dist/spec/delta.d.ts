import { type Requirement, type SpecTree } from './parser.js';
export interface DeltaSpec {
    added: Requirement[];
    modified: Requirement[];
    removed: {
        title: string;
        reason: string;
        migration: string;
    }[];
    renamed: {
        from: string;
        to: string;
    }[];
}
export declare function parseDeltaSpec(markdown: string): DeltaSpec;
export declare function mergeSpecs(living: SpecTree, delta: DeltaSpec): SpecTree;
