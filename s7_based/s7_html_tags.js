//the emscripten module must be run before this
{
    const p = new Promise((resolve) => {
        Module['onRuntimeInitialized'] = ()=>{
            console.log("loaded");
            resolve(Module);
        };
    });
    let s7script_deps_promise = p;
    class s7script extends HTMLElement{
        constructor(){
            self = super();
            this.self = self;
            this.done = false;
            this.failed = false;
            this.func = console.log;
        }
        connectedCallback(){
            if (this.done || this.failed){
                return;
            }
            const self = this.self;
            async function run(){
                const Module = await p;
                let prog = self.innerText;
                if (self.attributes.src?.nodeValue !== undefined){
	            let response = await fetch(self.attributes.src.nodeValue);
	            if (response.ok && response.status === 200){
	                prog = (await response.text()) + prog;
	            }else{
	                console.error(response);
                        return;
	            }
                }
                if (!(self.attributes['no-wrap'])){
		    prog = "(begin \n" + prog + "\n)";
	        }
                try{
                    const res = Module.s7_interop.evs(prog);
                    this.done = true;
                    this.func(res);
                }catch (e){
                    this.failed = true;
                    throw e;
                }
            }
            if (self.attributes['async']){
                this.p = run.bind(this)();
            }else{
                this.p = s7script_deps_promise.then(()=>(run.bind(this)()));
                s7script_deps_promise = this.p;
            }
        }
    }
    customElements.define("s7-script", s7script);
    class s7scriptMacro extends s7script{
        constructor(){
            super();
            const self = this.self;
            this.func = (res)=>{
                switch (typeof res){
                case "object":
                    self.innerHTML = "";self.appendChild(res);break;
                case "string":
                default:
                    self.innerHTML = res;
                }
            }
        }
    }
    customElements.define("s7-macro", s7scriptMacro);
}

