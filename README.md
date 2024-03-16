# infinite scroll

## expected behaviour of infinite scroll

| emit  | start                                                          | ok                                                                            | bad            | finish                          |
| ----- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------- | ------------------------------- |
| sync  | do nothing                                                     | insert item;update keyFront/keyBack;update intersect observer;                | do nothing     | do nothing                      |
| async | insert loading;set up waiters;lock to prevent more insertions; | remove loading;insert item;update keyFront/keyBack;update intersect observer; | remove loading | lock to permit more insertions; |
