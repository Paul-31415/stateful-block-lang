(provide 'await.scm)
(define halt ())
(define JS-AWAIT-js-func (eval-js "
(continuation,code) => {
  const promise = (async function (code) {
    return eval(code);
  })(code);
  return promise.then((v)=>(continuation(v)));
}
")
  )
(define (js-await code)
  (call/cc
   (lambda (c)
     (halt (JS-AWAIT-js-func c code))
     )
   )
  )
;;must be last line so the continuation actually halts.
(call/cc (lambda (halt-cont) (set! halt halt-cont)))
