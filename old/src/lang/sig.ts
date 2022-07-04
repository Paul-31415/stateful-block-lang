
export type Signature = Array<Argument>;//have the args section of this be a listy thing, have code.signature be a getter to do fancy stuff
//allow for the creation of new arg types using blocks
export type Argument = string | karg<any>;
type karg<T> = {
    name: string,
    key: keyof T,
    type: string,
}
