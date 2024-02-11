# pull-to-refresh behaviour

# 下拉刷新效果

## 状态机

```mermaid
stateDiagram-v2
    [*] --> armed
    armed --> idle: scrollDown
    idle --> armed: scrollToTop
    armed --> pocketRevealed: pullDown
    pocketRevealed --> armed: cancelPull
    pocketRevealed --> callbackCommitted: pullDownFarEnough
    callbackCommitted --> callbackFired: cancelPull
    callbackFired --> armed: okCallback
    callbackFired --> callbackFailed: failCallback
    callbackFailed --> pocketRevealed: pullDown
    callbackFailed --> armed: pullUp
    note left of pocketRevealed: pocket reads "继续下拉加载更多数据"
    note right of callbackCommitted: pocket reads "松手加载更多数据"
    note right of callbackFailed: pocket reads "加载失败，下拉重试"
    note left of callbackFired: pocket reads "加载中，请稍候"
```

### params for transition event listeners

```typescript
type Event<T> = {
    type: string,
    data: T
}

type TransitionEvent = Event<{
    leaving: any,
    entering: any,
    event: any,
}>
```

## 警惕

用 reduce 一定要指定初始值，否则如果数组只有一个元素的话，reducer
根本不会执行。数组没有元素的话，reducer 不执行是符合预期的。
