(provide 'import.scm)
(define fetch (eval-js 'fetch))
(define (load-remote path)
  (eval (append "(begin\n" (await-js (fetch path)) "\n)"))
  )
(define-macro (require file)
  `(unless (provided? ',file)
     (load-remote ',file))
  )

(unless (provided? 'await.scm);bootstrap await.scm because await is needed to do nice requires
  (write "using fallback require for await.scm . determinisim hasn't been tested here!")
  ((eval-js "(ev)=>fetch('await.scm').then((r)=>(ev('(begin\\n'+r.text()+'\\n)')))") eval)
  )
