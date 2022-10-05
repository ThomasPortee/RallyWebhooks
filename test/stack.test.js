class Stack {
    constructor() {
        this.top = -1;
        this.items = {};
    }
}


describe('My Stack', () => {


    it('is created empty', () => {
        const stack = new Stack();
        expect(stack.top).toBe(-1);
    });
    it('can push to the top', test.todo);
    it('can pop off', test.todo);
})