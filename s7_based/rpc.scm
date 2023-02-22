;;assoc-list of continuations from symbols
(define rpc-rets ())

(define (assoc-pop key alist aparent) 
  (cond ((null? alist) #f)
        ((eq? (caar alist) key)
         (begin
           (if (symbol? aparent) (eval `(set! ,aparent (cdr alist))) (set! (cdr aparent) (cdr alist)))
           (car alist)
           ))
        (#t (assoc-pop key (cdr alist) alist))
        ))
(define (ret/cc key value)
  (let ((c (assoc-pop key rpc-rets 'rpc-rets)))
    (if c ((cdr c) (cons 'ret value))
        (error 'unbound-rpc-continuation key)
    )
    ))
(define (error/cc key . value)
  (let ((c (assoc-pop key rpc-rets 'rpc-rets)))
    (if c ((cdr c) (cons 'error value))
        (error 'unbound-rpc-continuation key)
    )
    ))
;;immediate exit continuation, defined later
(define rpcc ())

;;note for rpc libraries:
;;  symbols starting or ending in a colon self-eval in scheme.
;;   so use them for symbol selectors.

(define-macro (rpc func . args)
    (let ((sym (gensym)) (res (gensym)))
      `(let ((,res (call/cc
                    (lambda (c)
                      (begin
                        (set! rpc-rets (cons (cons ',sym c) rpc-rets))
                        (rpcc (list 'call ',sym ',func . ,args))
                        )))))
         (if (eq? (car ,res) 'error)
             (eval ,res)
             (cdr ,res)
             )
         )
      )
    )
;;this line must be run last so the continuation consists of exiting
(call/cc (lambda (c) (set! rpcc c)))









 







