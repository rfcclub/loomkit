export declare function cmdArchive(name: string, options: {
    force?: boolean;
    reason?: string;
}): void;
export declare function mergeSpecIntoLiving(name: string, changeDir: string, specsDir: string): Promise<void>;
export declare function bumpVersion(pkgPath: string): string;
