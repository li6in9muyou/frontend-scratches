# infinite scroll

## expected behaviour of infinite scroll

|       | start                          | ok                                                                            | bad            |
| ----- | ------------------------------ | ----------------------------------------------------------------------------- | -------------- |
| sync  | do nothing                     | insert item;update keyFront/keyBack;update intersect observer;                | do nothing     |
| async | insert loading;set up waiters; | remove loading;insert item;update keyFront/keyBack;update intersect observer; | remove loading |
