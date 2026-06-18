export declare function getProjectRoot(): string;
/**
 * Returns the workspace directory. Prefers `openspec/` if it already exists
 * (shared with OpenSpec CLI), otherwise uses `loomkit/`.
 */
export declare function getLoomKitDir(): string;
export declare function getChangesDir(): string;
export declare function getChangeDir(name: string): string;
export declare function getSpecsDir(): string;
export declare function getSchemasDir(): string;
export declare function getPackageRoot(): string;
export declare function getBuiltinSchemasDir(): string;
export declare function getBuiltinAdaptersDir(): string;
export declare function readConfig(): Record<string, any>;
export declare function parseYamlSimple(yaml: string): Record<string, any>;
export declare function changeExists(name: string): boolean;
export declare function listChanges(): string[];
export declare function copyDir(src: string, dest: string): void;
export declare function writeFileSafe(path: string, content: string): void;
