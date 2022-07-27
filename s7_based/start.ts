import { newScheme } from "./scheme_rpc";
import { parse, prettyPrintThing, safePrintThing, thingify } from "./s_parse";

(window as any).thingify = thingify;
(window as any).pprint = prettyPrintThing;
(window as any).sprint = safePrintThing;
(window as any).parse = parse;
(window as any).newScheme = newScheme;
(window as any).editor = newScheme();
(window as any).scheme = newScheme();
(window as any).scheme2 = newScheme();
