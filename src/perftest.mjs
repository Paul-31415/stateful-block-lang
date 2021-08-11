import * as B from "./lang/base.js";
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
    const add = function* () {
        yield i + 1;
    };
    const div = function* () {
        yield 1 / (add().next().value);
    };
    for (i = 0; i < 10000000; i++) {
        a += div().next().value;
    }
    const end = process.hrtime();
    console.log(`  result:${a}, time: ${end[0] - now[0]}s and ${end[1] - now[1]}ns`);
}
console.log("testing as blocks:");
{
    const prog = new B.Progn([
        new B.Assign("a", new Float(0)),
        new B.Assign("i", new Float(0)),
        new B.While(new LT(new B.Var("i"), new B.Float(1000000)), new B.Assign("a", new B.Add([new B.Var("a"), new B.Div([new B.Float(1), new B.Assign("i", new B.Add([new B.Var('i'), new B.Float(1)]))])])))
    ]);
    const now = process.hrtime();
    const res = prog.run(new B.Scope());
    const end = process.hrtime();
    console.log(`  result:${res.v}, time: ${end[0] - now[0]}s and ${end[1] - now[1]}ns`);
}
