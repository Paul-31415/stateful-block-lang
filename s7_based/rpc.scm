
;;
;;(rpc foo 1 2 x) ->
;;    (call/cc (lambda (c) (begin
;;          (define {gensym}-? c)
;;          '(call {gensym}-? foo 1 2 ,x)
;;        ))

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
    (if c ((cdr c) value)
        (error 'unbound-rpc-continuation key)
    )
    ))
(define rpcc ())
(define-macro (rpc func . args)
    (let ((sym (gensym)))
      `(call/cc
        (lambda (c)
          (begin
            (set! rpc-rets (cons (cons ',sym c) rpc-rets))
            (rpcc (list 'call ',sym ',func . ,args))
            )))))
(call/cc (lambda (c) (set! rpcc c)))









 







