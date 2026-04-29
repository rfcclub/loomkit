export interface Assertion {
    target: string;
    operator: string;
    expected: string;
}
export declare function parseAssertion(text: string): Assertion;
