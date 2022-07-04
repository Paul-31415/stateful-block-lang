/*
import { Add, Assign, Div, Float, LT, Progn, Scope, Var, While } from "./lang/base";



console.log("testing for loop:");
{
    const now = process.hrtime();
    let a = 0;
    for (let i = 0; i < 1000000000; i++) {
        a += 1 / (i + 1);
    }
    const end = process.hrtime();
    console.log(`  result:${a}, time: ${end[0] - now[0]}s and ${end[1] - now[1]}ns`);
}

console.log("testing everything being iterators:");
{
    const now = process.hrtime();
    let a = 0;
    let i = 0;

    const add: () => IterableIterator<number> = function*() {
        yield i + 1;
    }
    const div = function*() {
        yield 1 / (add().next().value);
    }
    for (i = 0; i < 10000000; i++) {
        a += div().next().value as number;
    }
    const end = process.hrtime();
    console.log(`  result:${a}, time: ${end[0] - now[0]}s and ${end[1] - now[1]}ns`);
}
console.log("testing as blocks:")
{
    const prog = new Progn([
        new Assign("a", new Float(0)),
        new Assign("i", new Float(0)),
        new While(new LT(new Var("i"), new Float(1000000)),
            new Assign("a", new Add([new Var("a"), new Div([new Float(1), new Assign("i", new Add([new Var('i'), new Float(1)]))])]))
        )
    ]);
    const now = process.hrtime();
    const res = prog.run(new Scope());
    const end = process.hrtime();
    console.log(`  result:${(res as Float).v}, time: ${end[0] - now[0]}s and ${end[1] - now[1]}ns`);
}
*/
